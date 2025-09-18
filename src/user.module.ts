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
    AdminUser,
    AdminUserSchema,
} from './modules/user/schemas/AdminUserSchema';
import {
    Credential,
    CredentialSchema,
} from './modules/user/schemas/CredentialSchema';
import {
    DoctorUser,
    DoctorUserSchema,
} from './modules/user/schemas/DoctorUserSchema';
import {
    PatientUser,
    PatientUserSchema,
} from './modules/user/schemas/PatientUserSchema';
import {
    SupportUser,
    SupportUserSchema,
} from './modules/user/schemas/SupportUserSchema';
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
            { name: AdminUser.name, schema: AdminUserSchema },
            { name: DoctorUser.name, schema: DoctorUserSchema },
            { name: SupportUser.name, schema: SupportUserSchema },
            { name: PatientUser.name, schema: PatientUserSchema },
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
