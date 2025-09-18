import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AssistantController from './modules/assistant/AssistantController';
import { Chat, ChatSchema } from './modules/assistant/schemas/ChatSchema';
import {
    Message,
    MessageSchema,
} from './modules/assistant/schemas/MessageSchema';

import { CalendarModule } from './calendar.module';
import CalendarTool from './handlers/gpt/CalendarTool';
import ChatAssistant from './handlers/gpt/ChatAssistant';
import UserInfoTool from './handlers/gpt/UserInfoTool';
import AssistantService from './modules/assistant/AssistantService';
import {
    FileMetadata,
    FileMetadataSchema,
} from './modules/assistant/schemas/FileMetadataSchema';
import { UserModule } from './user.module';

@Module({
    controllers: [AssistantController],
    providers: [AssistantService, ChatAssistant, UserInfoTool, CalendarTool],
    imports: [
        UserModule,
        CalendarModule,
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
            { name: Chat.name, schema: ChatSchema },
            { name: FileMetadata.name, schema: FileMetadataSchema },
        ]),
    ],
    exports: [AssistantService, MongooseModule],
})
export class AssistantModule {}
