import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssistantModule } from './assistant.module';
import BlobStorageManager from './handlers/cloud/BlobStorageManager';
import PrescriptionController from './modules/prescription/PrescriptionController';
import PrescriptionService from './modules/prescription/PrescriptionService';
import {
    Prescription,
    PrescriptionSchema,
} from './modules/prescription/schemas/PrescriptionSchema';

@Module({
    controllers: [PrescriptionController],
    providers: [PrescriptionService, BlobStorageManager],
    imports: [
        AssistantModule,
        MongooseModule.forFeature([
            { name: Prescription.name, schema: PrescriptionSchema },
        ]),
    ],
    exports: [MongooseModule, PrescriptionService],
})
export class PrescriptionModule {}
