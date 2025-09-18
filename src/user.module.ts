import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import BlobStorageManager from './handlers/cloud/BlobStorageManager';
import AdminUserService from './modules/user/AdminUserService';
import AdminUserController from './modules/user/controllers/AdminUserController';
import DoctorUserController from './modules/user/controllers/DoctorUserController';
import PatientUserController from './modules/user/controllers/PatientUserController';
import SupportUserController from './modules/user/controllers/SupportUserController';
import DoctorUserService from './modules/user/DoctorUserService';
import PatientUserService from './modules/user/PatientUserService';
import {
    Credential,
    CredentialSchema,
} from './modules/user/schemas/CredentialSchema';
import { User, UserSchema } from './modules/user/schemas/UserSchema';
import SupportUserService from './modules/user/SupportUserService';

@Module({
    controllers: [
        AdminUserController,
        DoctorUserController,
        SupportUserController,
        PatientUserController,
    ],
    providers: [
        AdminUserService,
        DoctorUserService,
        SupportUserService,
        PatientUserService,
        BlobStorageManager,
    ],
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Credential.name, schema: CredentialSchema },
        ]),
    ],
    exports: [
        AdminUserService,
        DoctorUserService,
        SupportUserService,
        PatientUserService,
        BlobStorageManager,
        MongooseModule,
    ],
})
export class UserModule {}
