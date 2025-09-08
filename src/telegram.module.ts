import { Module } from '@nestjs/common';
import TelegramHandler from './handlers/messaging/TelegramHandler';
import AssistantService from './modules/assistant/AssistantService';
import TelegramController from './modules/telegram/TelegramController';
import TelegramService from './modules/telegram/TelegramService';
import UserService from './modules/user/UserService';

@Module({
    controllers: [TelegramController],
    providers: [
        TelegramService,
        TelegramHandler,
        UserService,
        AssistantService,
    ],
})
export class TelegramModule {}
