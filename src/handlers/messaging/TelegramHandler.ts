import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export default class TelegramHandler {
    private readonly logger = new Logger('TelegramHandler');
    private readonly environment: string = process.env.ENVIRONMENT || 'dev';
    private readonly token: string = process.env.TELEGRAM_TOKEN;

    async sendMessage(chatId: number, content: string): Promise<void> {
        this.logger.log(`Attempting to send message to chatId: ${chatId}`);
        this.logger.log(`Environment is: ${this.environment}`);
        this.logger.log(`Message content: ${content}`);

        if (this.environment === 'prod') {
            try {
                const response = await axios.post(
                    `https://api.telegram.org/bot${this.token}/sendMessage`,
                    {
                        chat_id: chatId,
                        text: content,
                        parse_mode: 'HTML',
                    },
                );
                this.logger.log(
                    `Message sent successfully. Response:`,
                    response.data,
                );
            } catch (error) {
                this.logger.error(`Failed to send message:`, error);
            }
        } else {
            this.logger.log(
                `Not sending message because environment is not 'prod'.`,
            );
        }
    }
}
