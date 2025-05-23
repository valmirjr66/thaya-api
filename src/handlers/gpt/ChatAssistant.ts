import { Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { TextContentBlock } from 'openai/resources/beta/threads/messages.mjs';
import { Annotation } from 'src/types/gpt';
import { getUserInfo } from './UserInfoTool';
import { getWeatherInfo } from './WeatherTool';
import { RunSubmitToolOutputsParams } from 'openai/resources/beta/threads/runs/runs.mjs';
import { getUserAgenda } from './AgendaTool';

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
    private readonly assistantId: string;
    private readonly openaiClient: OpenAI = new OpenAI();

    constructor(assistantId: string) {
        this.assistantId = assistantId;
    }

    public async startThread(): Promise<string> {
        const thread = await this.openaiClient.beta.threads.create();
        return thread.id;
    }

    public async addMessageToThread(
        threadId: string,
        message: string,
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

        const context: Record<string, any> = {}; // Store intermediate outputs like location

        while (
            run.status === 'requires_action' &&
            run.required_action?.type === 'submit_tool_outputs'
        ) {
            const toolCalls =
                run.required_action.submit_tool_outputs.tool_calls;

            const toolOutputs: RunSubmitToolOutputsParams.ToolOutput[] = [];

            for (const call of toolCalls) {
                const args = JSON.parse(call.function.arguments);

                if (call.function.name === 'get_user_info') {
                    const userInfo = await getUserInfo();

                    context.userInfo = userInfo;

                    toolOutputs.push({
                        tool_call_id: call.id,
                        output: JSON.stringify(userInfo),
                    });
                } else if (call.function.name === 'get_weather_info') {
                    const latitude: string =
                        context.userInfo?.currentLocation.latitute ||
                        args.location?.latitute;

                    const longitude: string =
                        context.userInfo?.currentLocation.longitude ||
                        args.location?.longitude;

                    const weatherInfo = await getWeatherInfo({
                        latitude: Number(latitude),
                        longitude: Number(longitude),
                    });

                    toolOutputs.push({
                        tool_call_id: call.id,
                        output: JSON.stringify(weatherInfo),
                    });
                } else if (call.function.name === 'get_user_agenda') {
                    const userAgenda = await getUserAgenda(args);

                    toolOutputs.push({
                        tool_call_id: call.id,
                        output: JSON.stringify(userAgenda),
                    });
                } else {
                    throw new Error(`Unknown function: ${call.function.name}`);
                }
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

        let response: TextResponse;

        const run = this.openaiClient.beta.threads.runs
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

        await run.done();

        return response;
    }
}
