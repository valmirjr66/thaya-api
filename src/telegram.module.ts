import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import BlobStorageManager from './handlers/cloud/BlobStorageManager';
import CalendarTool from './handlers/gpt/CalendarTool';
import ChatAssistant from './handlers/gpt/ChatAssistant';
import UserInfoTool from './handlers/gpt/UserInfoTool';
import WeatherTool from './handlers/gpt/WeatherTool';
import TelegramHandler from './handlers/messaging/TelegramHandler';
import AssistantService from './modules/assistant/AssistantService';
import { Chat, ChatSchema } from './modules/assistant/schemas/ChatSchema';
import {
    FileMetadata,
    FileMetadataSchema,
} from './modules/assistant/schemas/FileMetadataSchema';
import {
    Message,
    MessageSchema,
} from './modules/assistant/schemas/MessageSchema';
import TelegramController from './modules/telegram/TelegramController';
import TelegramService from './modules/telegram/TelegramService';
import {
    Credential,
    CredentialSchema,
} from './modules/user/schemas/CredentialSchema';
import { User, UserSchema } from './modules/user/schemas/UserSchema';
import UserService from './modules/user/UserService';

@Module({
    controllers: [TelegramController],
    providers: [
        TelegramService,
        TelegramHandler,
        UserService,
        AssistantService,
        BlobStorageManager,
        ChatAssistant,
        WeatherTool,
        UserInfoTool,
        CalendarTool,
    ],
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([
            { name: Credential.name, schema: CredentialSchema },
        ]),
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
        ]),
        MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
        MongooseModule.forFeature([
            { name: FileMetadata.name, schema: FileMetadataSchema },
        ]),
    ],
})
export class TelegramModule {}
