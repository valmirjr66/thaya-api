import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import BlobStorageManager from './handlers/cloud/BlobStorageManager';
import TelegramHandler from './handlers/messaging/TelegramHandler';
import CalendarService from './modules/calendar/CalendarService';
import {
    Calendar,
    CalendarSchema,
} from './modules/calendar/schemas/CalendarSchema';
import RoutinesController from './modules/routines/RoutinesController';
import RoutinesService from './modules/routines/RoutinesService';
import {
    Credential,
    CredentialSchema,
} from './modules/user/schemas/CredentialSchema';
import { User, UserSchema } from './modules/user/schemas/UserSchema';
import UserService from './modules/user/UserService';

@Module({
    controllers: [RoutinesController],
    providers: [
        RoutinesService,
        UserService,
        CalendarService,
        TelegramHandler,
        BlobStorageManager,
    ],
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([
            { name: Credential.name, schema: CredentialSchema },
        ]),
        MongooseModule.forFeature([
            { name: Calendar.name, schema: CalendarSchema },
        ]),
    ],
})
export class RoutinesModule {}
