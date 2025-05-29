import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { TextContentBlock } from 'openai/resources/beta/threads/messages.mjs';
import { RunSubmitToolOutputsParams } from 'openai/resources/beta/threads/runs/runs.mjs';
import { RequiredActionFunctionToolCall } from 'openai/src/resources/beta/threads/runs/runs.js';
import { Annotation } from 'src/types/gpt';
import CalendarTool from './CalendarTool';
import UserInfoTool from './UserInfoTool';
import WeatherTool from './WeatherTool';

export class TextResponse {
    constructor(content: string, annotations?: Annotation[]) {
        this.content = content;
        this.annotations = annotations;
    }

    content: string;
    annotations?: Annotation[];
}

@Injectable()
export default class ChatAssistant {
    private readonly logger: Logger = new Logger('ChatAssistant');
    private readonly assistantId: string = process.env.ASSISTANT_ID;
    private readonly openaiClient: OpenAI = new OpenAI();

    constructor(
        private readonly weatherTool: WeatherTool,
        private readonly userInfoTool: UserInfoTool,
        private readonly calendarTool: CalendarTool,
    ) {}

    public async startThread(): Promise<string> {
        const thread = await this.openaiClient.beta.threads.create();
        return thread.id;
    }

    public async addMessageToThread(
        threadId: string,
        message: string,
        userEmail: string,
    ): Promise<TextResponse> {
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
            const toolCalls =
                run.required_action.submit_tool_outputs.tool_calls;

            const toolOutputs: RunSubmitToolOutputsParams.ToolOutput[] = [];

            for (const call of toolCalls) {
                await this.executeToolCall(
                    call,
                    context,
                    toolOutputs,
                    userEmail,
                );
            }

            run =
                await this.openaiClient.beta.threads.runs.submitToolOutputsAndPoll(
                    threadId,
                    run.id,
                    { tool_outputs: toolOutputs },
                );
        }

        if (run.status === 'completed') {
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
                throw new Error('Unknown response format');
            }

            return new TextResponse(
                responseContent[0].text.value,
                responseContent[0].text.annotations as Annotation[],
            );
        } else {
            this.logger.log(
                `Run status was: '${run.status}' on thread ${threadId}.
                Error is as following: ${run.last_error}`,
            );

            throw new Error("Run wasn't completed");
        }
    }

    public async addMessageToThreadByStream(
        threadId: string,
        message: string,
        userEmail: string,
        streamingCallback: (
            textSnapshot: string,
            annotationsSnapshot: Annotation[],
            finished: boolean,
        ) => void,
    ): Promise<TextResponse> {
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
                    `TextCreated for thread '${threadId}' with following incoming message '${message}'`,
                ),
            )
            .on('textDelta', (_textDelta, snapshot) =>
                streamingCallback(
                    snapshot.value,
                    snapshot.annotations as Annotation[],
                    false,
                ),
            )
            .on('messageDone', async (message) => {
                const textContent = message.content[0] as TextContentBlock;

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
            const toolCalls =
                run.required_action.submit_tool_outputs.tool_calls;

            const toolOutputs: RunSubmitToolOutputsParams.ToolOutput[] = [];

            for (const call of toolCalls) {
                await this.executeToolCall(
                    call,
                    context,
                    toolOutputs,
                    userEmail,
                );
            }

            run =
                await this.openaiClient.beta.threads.runs.submitToolOutputsAndPoll(
                    threadId,
                    run.id,
                    { tool_outputs: toolOutputs },
                );
        }

        if (!response) {
            const finalMessages =
                await this.openaiClient.beta.threads.messages.list(threadId);

            const finalContent = finalMessages.data[0]?.content;

            if (
                !finalContent ||
                finalContent.length !== 1 ||
                finalContent[0].type !== 'text'
            ) {
                throw new Error('No valid response after tool calls');
            }

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
        userEmail: string,
    ) {
        const args = JSON.parse(toolCall.function.arguments);

        if (toolCall.function.name === 'get_user_info') {
            const userInfo = await this.userInfoTool.getUserInfo(userEmail);

            context.userInfo = userInfo;

            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(userInfo),
            });
        } else if (toolCall.function.name === 'get_weather_info') {
            const latitude: string =
                context.userInfo?.currentLocation.latitute ||
                args.location?.latitute;

            const longitude: string =
                context.userInfo?.currentLocation.longitude ||
                args.location?.longitude;

            const weatherInfo = await this.weatherTool.getWeatherInfo({
                latitude: Number(latitude),
                longitude: Number(longitude),
            });

            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(weatherInfo),
            });
        } else if (toolCall.function.name === 'get_user_agenda') {
            const userAgenda = await this.calendarTool.getUserAgenda(args);

            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(userAgenda),
            });
        } else if (toolCall.function.name === 'get_current_datetime') {
            const currentDateTime =
                await this.calendarTool.getCurrentDatetime();

            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(currentDateTime),
            });
        } else {
            throw new Error(`Unknown function: ${toolCall.function.name}`);
        }
    }
}
