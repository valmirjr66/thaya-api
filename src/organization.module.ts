import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import OrganizationController from './modules/organization/OrganizationController';
import OrganizationService from './modules/organization/OrganizationService';
import {
    Organization,
    OrganizationSchema,
} from './modules/organization/schemas/OrganizationSchema';

@Module({
    controllers: [OrganizationController],
    providers: [OrganizationService],
    imports: [
        MongooseModule.forFeature([
            { name: Organization.name, schema: OrganizationSchema },
        ]),
    ],
})
export class OrganizationModule {}
