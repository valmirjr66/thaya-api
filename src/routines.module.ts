import { Module } from '@nestjs/common';
import { AssistantModule } from './assistant.module';
import { CalendarModule } from './calendar.module';
import TelegramHandler from './handlers/messaging/TelegramHandler';
import RoutinesController from './modules/routines/RoutinesController';
import RoutinesService from './modules/routines/RoutinesService';
import { UserModule } from './user.module';

@Module({
    controllers: [RoutinesController],
    providers: [RoutinesService, TelegramHandler],
    imports: [UserModule, CalendarModule, AssistantModule],
})
export class RoutinesModule {}
