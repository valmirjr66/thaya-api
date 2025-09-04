import { ChatType } from 'src/types/telegram';

export default class IncomingMessageDto {
    constructor(
        public update_id: number,
        public message: {
            message_id: number;
            from: {
                id: number;
                is_bot: boolean;
                first_name?: string;
                last_name?: string;
                username?: string;
                language_code?: string;
            };
            chat: {
                id: number;
                type: ChatType;
            };
            date: number;
            text?: string;
        },
    ) {}
}
