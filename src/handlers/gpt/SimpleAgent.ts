import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/src/resources/index.js';

export default class SimpleAgent {
    private readonly setupMessage: string;
    private readonly model: string;

    constructor(setupMessage: string, model = 'gpt-4o') {
        this.setupMessage = setupMessage;
        this.model = model;
    }

    async createCompletion(message: string): Promise<string> {
        const openai = new OpenAI();

        const processedMessages: Array<ChatCompletionMessageParam> = [
            { role: 'system', content: this.setupMessage },
            { role: 'user', content: message },
        ];

        const completion = await openai.chat.completions.create({
            messages: processedMessages,
            model: this.model,
        });

        return completion.choices[0].message.content;
    }
}
