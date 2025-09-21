import { Body, Controller, Post } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import TelegramService from './TelegramService';
import IncomingMessageDto from './dto/IncomingMessageDto';
import IncomingMessageModel from './model/IncomingMessageModel';

@ApiTags('Telegram')
@Controller('telegram')
export default class TelegramController {
    constructor(private readonly telegramService: TelegramService) {}

    @Post('message-webhook')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async handleIncomingMessage(
        @Body() dto: IncomingMessageDto,
    ): Promise<void> {
        await this.telegramService.handleIncomingMessage(
            new IncomingMessageModel(
                dto.update_id,
                dto.message.message_id,
                dto.message.from.id,
                dto.message.from.is_bot,
                dto.message.chat.id,
                dto.message.chat.type,
                dto.message.date,
                dto.message.text,
            ),
        );
    }
}
