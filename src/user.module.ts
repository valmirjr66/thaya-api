import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import BlobStorageManager from './handlers/cloud/BlobStorageManager';
import UserController from './modules/user/UserController';
import UserService from './modules/user/UserService';
import {
    Credential,
    CredentialSchema,
} from './modules/user/schemas/CredentialSchema';
import { User, UserSchema } from './modules/user/schemas/UserSchema';

@Module({
    controllers: [UserController],
    providers: [UserService, BlobStorageManager],
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([
            { name: Credential.name, schema: CredentialSchema },
        ]),
    ],
})
export class UserModule {}
