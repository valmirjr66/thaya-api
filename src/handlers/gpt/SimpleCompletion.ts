import { Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/src/resources/index.js';

export default class SimpleCompletion {
    private readonly logger: Logger = new Logger('SimpleCompletion');
    private readonly setupMessage: string;
    private readonly model: string;

    constructor(setupMessage: string, model = 'gpt-4o') {
        this.setupMessage = setupMessage;
        this.model = model;
    }

    async createCompletion(message: string): Promise<string> {
        this.logger.log('Creating OpenAI client instance');
        const openai = new OpenAI();

        const processedMessages: Array<ChatCompletionMessageParam> = [
            { role: 'system', content: this.setupMessage },
            { role: 'user', content: message },
        ];

        this.logger.debug(
            `Processed messages: ${JSON.stringify(processedMessages)}`,
        );
        this.logger.log(`Requesting completion with model: ${this.model}`);

        try {
            const completion = await openai.chat.completions.create({
                messages: processedMessages,
                model: this.model,
            });

            const responseContent = completion.choices[0].message.content;
            this.logger.log('Received completion from OpenAI');
            this.logger.debug(`Completion response: ${responseContent}`);

            return responseContent;
        } catch (error) {
            this.logger.error(
                'Error during OpenAI completion',
                error instanceof Error ? error.stack : String(error),
            );
            throw error;
        }
    }
}
