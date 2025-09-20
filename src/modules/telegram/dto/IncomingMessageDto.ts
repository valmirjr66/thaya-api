import { ApiProperty } from '@nestjs/swagger';
import { ChatType } from 'src/types/telegram';

class MessagePayloadChatDto {
    @ApiProperty({ required: true })
    id: number;

    @ApiProperty({ required: true })
    type: ChatType;
}

class MessagePayloadFromDto {
    @ApiProperty({ required: true })
    id: number;

    @ApiProperty({ required: true })
    is_bot: boolean;

    @ApiProperty()
    first_name?: string;

    @ApiProperty()
    last_name?: string;

    @ApiProperty()
    username?: string;

    @ApiProperty()
    language_code?: string;
}

class MessagePayloadDto {
    @ApiProperty({ required: true })
    message_id: number;

    @ApiProperty({ required: true })
    from: MessagePayloadFromDto;

    @ApiProperty({ required: true })
    chat: MessagePayloadChatDto;

    @ApiProperty({ required: true })
    date: number;

    @ApiProperty()
    text?: string;
}

export default class IncomingMessageDto {
    @ApiProperty({ required: true })
    public update_id: number;

    @ApiProperty({ required: true, type: MessagePayloadDto })
    public message: MessagePayloadDto;

    constructor(update_id: number, message: MessagePayloadDto) {
        this.update_id = update_id;
        this.message = message;
    }
}
