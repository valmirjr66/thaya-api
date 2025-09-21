import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PatientRecordController from './modules/patient-record/PatientRecordController';
import PatientRecordService from './modules/patient-record/PatientRecordService';
import {
    PatientRecord,
    PatientRecordSchema,
} from './modules/patient-record/schemas/PatientRecordSchema';

@Module({
    controllers: [PatientRecordController],
    providers: [PatientRecordService],
    imports: [
        MongooseModule.forFeature([
            { name: PatientRecord.name, schema: PatientRecordSchema },
        ]),
    ],
    exports: [MongooseModule, PatientRecordService],
})
export class PatientRecordsModule {}
