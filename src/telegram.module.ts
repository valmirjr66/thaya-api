import { Module } from '@nestjs/common';
import { AssistantModule } from './assistant.module';
import { CalendarModule } from './calendar.module';
import TelegramHandler from './handlers/messaging/TelegramHandler';
import TelegramController from './modules/telegram/TelegramController';
import TelegramService from './modules/telegram/TelegramService';
import { UserModule } from './user.module';

@Module({
    controllers: [TelegramController],
    providers: [TelegramService, TelegramHandler],
    imports: [UserModule, AssistantModule, CalendarModule],
})
export class TelegramModule {}
