import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import BlobStorageManager from './handlers/cloud/BlobStorageManager';
import OrganizationController from './modules/organization/OrganizationController';
import OrganizationService from './modules/organization/OrganizationService';
import {
    Organization,
    OrganizationSchema,
} from './modules/organization/schemas/OrganizationSchema';

@Module({
    controllers: [OrganizationController],
    providers: [OrganizationService, BlobStorageManager],
    imports: [
        MongooseModule.forFeature([
            { name: Organization.name, schema: OrganizationSchema },
        ]),
    ],
    exports: [OrganizationService, MongooseModule],
})
export class OrganizationModule {}
