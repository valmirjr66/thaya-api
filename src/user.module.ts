import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import BlobStorageManager from './handlers/cloud/BlobStorageManager';
import CalendarService from './modules/user/CalendarService';
import UserController from './modules/user/UserController';
import UserService from './modules/user/UserService';
import {
    Calendar,
    CalendarSchema,
} from './modules/user/schemas/CalendarSchema';
import {
    Credential,
    CredentialSchema,
} from './modules/user/schemas/CredentialSchema';
import { User, UserSchema } from './modules/user/schemas/UserSchema';

@Module({
    controllers: [UserController],
    providers: [UserService, CalendarService, BlobStorageManager],
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([
            { name: Calendar.name, schema: CalendarSchema },
        ]),
        MongooseModule.forFeature([
            { name: Credential.name, schema: CredentialSchema },
        ]),
    ],
})
export class UserModule {}
