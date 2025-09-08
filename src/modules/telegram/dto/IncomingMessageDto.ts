import { ApiProperty } from '@nestjs/swagger';
import { ChatType } from 'src/types/telegram';

type MessagePayload = {
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
};

export default class IncomingMessageDto {
    @ApiProperty()
    public update_id: number;

    @ApiProperty()
    public message: MessagePayload;

    constructor(update_id: number, message: MessagePayload) {
        this.update_id = update_id;
        this.message = message;
    }
}
