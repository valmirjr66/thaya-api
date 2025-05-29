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

import AgendaTool from './handlers/gpt/AgendaTool';
import ChatAssistant from './handlers/gpt/ChatAssistant';
import UserInfoTool from './handlers/gpt/UserInfoTool';
import WeatherTool from './handlers/gpt/WeatherTool';
import {
    FileMetadata,
    FileMetadataSchema,
} from './modules/assistant/schemas/FileMetadataSchema';

@Module({
    controllers: [AssistantController],
    providers: [
        AssistantService,
        ChatAssistant,
        UserInfoTool,
        WeatherTool,
        AgendaTool,
        AssistantGateway,
    ],
    imports: [
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
            { name: Chat.name, schema: ChatSchema },
            { name: FileMetadata.name, schema: FileMetadataSchema },
        ]),
    ],
})
export class AssistantModule {}
