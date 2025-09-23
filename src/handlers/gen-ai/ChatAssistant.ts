import { Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { TextContentBlock } from 'openai/resources/beta/threads/messages.mjs';
import { RunSubmitToolOutputsParams } from 'openai/resources/beta/threads/runs/runs.mjs';
import { RequiredActionFunctionToolCall } from 'openai/src/resources/beta/threads/runs/runs.js';
import { Annotation } from 'src/types/gen-ai';
import CalendarTool from './CalendarTool';
import UserInfoTool from './UserInfoTool';

export class TextResponse {
    constructor(content: string, annotations?: Annotation[]) {
        this.content = content;
        this.annotations = annotations;
    }

    content: string;
    annotations?: Annotation[];
}

export default class ChatAssistant {
    private readonly logger: Logger = new Logger('ChatAssistant');
    private readonly openaiClient: OpenAI = new OpenAI();
    private readonly assistantId: string;

    constructor(
        private readonly userInfoTool: UserInfoTool,
        private readonly calendarTool: CalendarTool,
        private readonly assistant: 'thaya-m.d.' | 'thaya-connect',
    ) {
        this.assistantId =
            assistant === 'thaya-connect'
                ? process.env.THAYA_CONNECT_ID
                : process.env.THAYA_MD_ID;
    }

    public async startThread(): Promise<string> {
        this.logger.log('Starting new thread...');
        const thread = await this.openaiClient.beta.threads.create();
        this.logger.log(`Thread started with id: ${thread.id}`);
        return thread.id;
    }

    public async addMessageToThread(
        threadId: string,
        message: string,
        userId: string,
    ): Promise<TextResponse> {
        this.logger.log(`Adding message to thread ${threadId}: "${message}"`);
        await this.openaiClient.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
        });

        let run = await this.openaiClient.beta.threads.runs.createAndPoll(
            threadId,
            {
                assistant_id: this.assistantId,
            },
        );

        const context: Record<string, any> = {};

        while (
            run.status === 'requires_action' &&
            run.required_action?.type === 'submit_tool_outputs'
        ) {
            this.logger.log(
                `Run requires action: submit_tool_outputs on thread ${threadId}`,
            );
            const toolCalls =
                run.required_action.submit_tool_outputs.tool_calls;

            const toolOutputs: RunSubmitToolOutputsParams.ToolOutput[] = [];

            for (const call of toolCalls) {
                this.logger.log(
                    `Executing tool call: ${call.function.name} (id: ${call.id})`,
                );
                await this.executeToolCall(call, context, toolOutputs, userId);
            }

            this.logger.log(
                `Submitting tool outputs for thread ${threadId}: ${JSON.stringify(toolOutputs)}`,
            );
            run =
                await this.openaiClient.beta.threads.runs.submitToolOutputsAndPoll(
                    threadId,
                    run.id,
                    { tool_outputs: toolOutputs },
                );
        }

        if (run.status === 'completed') {
            this.logger.log(`Run completed for thread ${threadId}`);
            const messages = await this.openaiClient.beta.threads.messages.list(
                run.thread_id,
            );

            const responseContent = messages.data[0].content;

            // TODO: Remove this validation as it's only a temporary workaround
            // so I don't have to deal with all response types right now
            if (
                responseContent.length > 1 ||
                responseContent[0].type !== 'text'
            ) {
                this.logger.error(
                    `Unknown response format for thread ${threadId}: ${JSON.stringify(responseContent)}`,
                );
                throw new Error('Unknown response format');
            }

            this.logger.log(
                `Returning response for thread ${threadId}: "${responseContent[0].text.value}"`,
            );
            return new TextResponse(
                responseContent[0].text.value,
                responseContent[0].text.annotations as Annotation[],
            );
        } else {
            this.logger.error(
                `Run status was: '${run.status}' on thread ${threadId}. Error: ${JSON.stringify(run.last_error)}`,
            );

            throw new Error("Run wasn't completed");
        }
    }

    public async addMessageToThreadByStream(
        threadId: string,
        message: string,
        userId: string,
        streamingCallback: (
            textSnapshot: string,
            annotationsSnapshot: Annotation[],
            finished: boolean,
        ) => void,
    ): Promise<TextResponse> {
        this.logger.log(
            `Adding message to thread ${threadId} (stream): "${message}"`,
        );
        await this.openaiClient.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
        });

        let response: TextResponse | undefined;

        const runStream = this.openaiClient.beta.threads.runs
            .stream(threadId, {
                assistant_id: this.assistantId,
            })
            .on('textCreated', () =>
                this.logger.log(
                    `TextCreated for thread '${threadId}' with incoming message '${message}'`,
                ),
            )
            .on('textDelta', (_textDelta, snapshot) => {
                this.logger.log(
                    `Received text delta for thread ${threadId}: "${snapshot.value}"`,
                );
                streamingCallback(
                    snapshot.value,
                    snapshot.annotations as Annotation[],
                    false,
                );
            })
            .on('messageDone', async (message) => {
                const textContent = message.content[0] as TextContentBlock;
                this.logger.log(
                    `Message done for thread ${threadId}: "${textContent.text.value}"`,
                );
                streamingCallback(
                    textContent.text.value,
                    textContent.text.annotations as Annotation[],
                    true,
                );

                response = new TextResponse(
                    textContent.text.value,
                    textContent.text.annotations as Annotation[],
                );
            });

        await runStream.done();

        let run = await runStream.finalRun();

        const context: Record<string, any> = {};

        while (
            run.status === 'requires_action' &&
            run.required_action?.type === 'submit_tool_outputs'
        ) {
            this.logger.log(
                `Run requires action: submit_tool_outputs on thread ${threadId} (stream)`,
            );
            const toolCalls =
                run.required_action.submit_tool_outputs.tool_calls;

            const toolOutputs: RunSubmitToolOutputsParams.ToolOutput[] = [];

            for (const call of toolCalls) {
                this.logger.log(
                    `Executing tool call: ${call.function.name} (id: ${call.id})`,
                );
                await this.executeToolCall(call, context, toolOutputs, userId);
            }

            this.logger.log(
                `Submitting tool outputs for thread ${threadId} (stream): ${JSON.stringify(toolOutputs)}`,
            );
            run =
                await this.openaiClient.beta.threads.runs.submitToolOutputsAndPoll(
                    threadId,
                    run.id,
                    { tool_outputs: toolOutputs },
                );
        }

        if (!response) {
            this.logger.warn(
                `No response from stream for thread ${threadId}, fetching final messages...`,
            );
            const finalMessages =
                await this.openaiClient.beta.threads.messages.list(threadId);

            const finalContent = finalMessages.data[0]?.content;

            if (
                !finalContent ||
                finalContent.length !== 1 ||
                finalContent[0].type !== 'text'
            ) {
                this.logger.error(
                    `No valid response after tool calls for thread ${threadId}: ${JSON.stringify(finalContent)}`,
                );
                throw new Error('No valid response after tool calls');
            }

            this.logger.log(
                `Returning final response for thread ${threadId}: "${finalContent[0].text.value}"`,
            );
            response = new TextResponse(
                finalContent[0].text.value,
                finalContent[0].text.annotations as Annotation[],
            );

            streamingCallback(
                finalContent[0].text.value,
                finalContent[0].text.annotations as Annotation[],
                true,
            );
        }

        return response;
    }

    private async executeToolCall(
        toolCall: RequiredActionFunctionToolCall,
        context: Record<string, any>,
        toolOutputs: RunSubmitToolOutputsParams.ToolOutput[],
        userId: string,
    ) {
        this.logger.log(
            `Executing tool call function: ${toolCall.function.name} (id: ${toolCall.id}) with args: ${toolCall.function.arguments}`,
        );
        const args = JSON.parse(toolCall.function.arguments);

        if (toolCall.function.name === 'get_user_info') {
            const userInfo = await this.userInfoTool.getUserInfo(
                this.assistant === 'thaya-m.d.' ? 'doctor' : 'patient',
                userId,
            );

            context.userInfo = userInfo;

            this.logger.log(
                `get_user_info result: ${JSON.stringify(userInfo)}`,
            );
            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(userInfo),
            });
        } else if (toolCall.function.name === 'get_user_agenda') {
            this.logger.log(
                `get_user_agenda for user with id: ${userId} with args: ${JSON.stringify(args)}`,
            );
            const userAgenda = await this.calendarTool.getUserAgenda(
                userId,
                args,
            );

            this.logger.log(
                `get_user_agenda result: ${JSON.stringify(userAgenda)}`,
            );
            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(userAgenda),
            });
        } else if (toolCall.function.name === 'get_current_datetime') {
            this.logger.log(`get_current_datetime called`);
            const currentDateTime =
                await this.calendarTool.getCurrentDatetime();

            this.logger.log(
                `get_current_datetime result: ${JSON.stringify(currentDateTime)}`,
            );
            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(currentDateTime),
            });
        } else if (toolCall.function.name === 'insert_calendar_occurrence') {
            this.logger.log(
                `insert_calendar_occurrence for user: ${userId} with args: ${JSON.stringify(
                    args,
                )}`,
            );

            const datetime = new Date(args.datetime);

            if (isNaN(datetime.getTime())) {
                this.logger.error(`Invalid datetime format: ${args.datetime}`);
                throw new Error(
                    `Invalid datetime format: ${args.datetime}. Please provide a valid ISO 8601 date string.`,
                );
            }

            await this.calendarTool.insertUserCalendarOccurrence(
                userId,
                args.patientId,
                datetime,
                args.description,
            );

            this.logger.log(`insert_calendar_occurrence completed`);

            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({ success: true }),
            });
        } else if (toolCall.function.name === 'delete_calendar_occurrence') {
            this.logger.log(
                `delete_calendar_occurrence for user: ${userId} with args: ${JSON.stringify(
                    args,
                )}`,
            );

            await this.calendarTool.deleteUserCalendarOccurrence(
                args.occurrenceId,
            );

            this.logger.log(`delete_calendar_occurrence completed`);

            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({ success: true }),
            });
        } else if (toolCall.function.name === 'update_calendar_occurrence') {
            this.logger.log(
                `update_calendar_occurrence for user: ${userId} with args: ${JSON.stringify(
                    args,
                )}`,
            );

            const newDatetime = new Date(args.newDatetime);

            if (isNaN(newDatetime.getTime())) {
                this.logger.error(
                    `Invalid newDatetime format: ${args.newDatetime}`,
                );
                throw new Error(
                    `Invalid newDatetime format: ${args.newDatetime}. Please provide a valid ISO 8601 date string.`,
                );
            }

            await this.calendarTool.updateUserCalendarOccurrence(
                args.occurrenceId,
                newDatetime,
                args.newDescription,
            );

            this.logger.log(`update_calendar_occurrence completed`);

            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({ success: true }),
            });
        } else if (toolCall.function.name === 'list_doctor_patients') {
            this.logger.log(`get_patients called for user: ${userId}`);

            const patients = await this.userInfoTool.getDoctorPatients(userId);

            this.logger.log(`get_patients result: ${JSON.stringify(patients)}`);

            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(patients),
            });
        } else {
            this.logger.error(`Unknown function: ${toolCall.function.name}`);
            throw new Error(`Unknown function: ${toolCall.function.name}`);
        }
    }
}
