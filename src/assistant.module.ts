import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ThayaConnectController from './modules/assistant/ThayaConnectController';
import ThayaMDController from './modules/assistant/ThayaMDController';
import {
    Message,
    MessageSchema,
} from './modules/assistant/schemas/MessageSchema';
import {
    ThayaConnectChat,
    ThayaConnectChatSchema,
} from './modules/assistant/schemas/ThayaConnectChatSchema';
import {
    ThayaMDChat,
    ThayaMDChatSchema,
} from './modules/assistant/schemas/ThayaMDChatSchema';

import { CalendarModule } from './calendar.module';
import CalendarTool from './handlers/gpt/CalendarTool';
import ChatAssistant from './handlers/gpt/ChatAssistant';
import UserInfoTool from './handlers/gpt/UserInfoTool';
import ThayaConnectService from './modules/assistant/ThayaConnectService';
import ThayaMDGateway from './modules/assistant/ThayaMDGateway';
import ThayaMDService from './modules/assistant/ThayaMDService';
import {
    FileMetadata,
    FileMetadataSchema,
} from './modules/assistant/schemas/FileMetadataSchema';
import { UserModule } from './user.module';

@Module({
    controllers: [ThayaConnectController, ThayaMDController],
    providers: [
        ThayaMDGateway,
        ThayaMDService,
        ThayaConnectService,
        ChatAssistant,
        UserInfoTool,
        CalendarTool,
    ],
    imports: [
        UserModule,
        CalendarModule,
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
            { name: ThayaMDChat.name, schema: ThayaMDChatSchema },
            { name: ThayaConnectChat.name, schema: ThayaConnectChatSchema },
            { name: FileMetadata.name, schema: FileMetadataSchema },
        ]),
    ],
    exports: [ThayaMDService, ThayaConnectService, MongooseModule],
})
export class AssistantModule {}
