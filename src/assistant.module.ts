import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AssistantController from './modules/assistant/AssistantController';
import { AssistantGateway } from './modules/assistant/AssistantGateway';
import AssistantService from './modules/assistant/AssistantService';
import { Chat, ChatSchema } from './modules/assistant/schemas/ChatSchema';
import {
    Message,
    MessageSchema,
} from './modules/assistant/schemas/MessageSchema';

import BlobStorageManager from './handlers/cloud/BlobStorageManager';
import CalendarTool from './handlers/gpt/CalendarTool';
import ChatAssistant from './handlers/gpt/ChatAssistant';
import UserInfoTool from './handlers/gpt/UserInfoTool';
import WeatherTool from './handlers/gpt/WeatherTool';
import {
    FileMetadata,
    FileMetadataSchema,
} from './modules/assistant/schemas/FileMetadataSchema';
import CalendarService from './modules/calendar/CalendarService';
import {
    Calendar,
    CalendarSchema,
} from './modules/calendar/schemas/CalendarSchema';
import UserService from './modules/user/UserService';
import {
    Credential,
    CredentialSchema,
} from './modules/user/schemas/CredentialSchema';
import { User, UserSchema } from './modules/user/schemas/UserSchema';

@Module({
    controllers: [AssistantController],
    providers: [
        AssistantService,
        CalendarService,
        UserService,
        ChatAssistant,
        UserInfoTool,
        WeatherTool,
        CalendarTool,
        AssistantGateway,
        BlobStorageManager,
    ],
    imports: [
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
            { name: Chat.name, schema: ChatSchema },
            { name: FileMetadata.name, schema: FileMetadataSchema },
            { name: User.name, schema: UserSchema },
            { name: Credential.name, schema: CredentialSchema },
            { name: Calendar.name, schema: CalendarSchema },
        ]),
    ],
})
export class AssistantModule {}
