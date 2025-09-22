import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssistantModule } from './assistant.module';
import PatientRecordController from './modules/patient-record/PatientRecordController';
import PatientRecordService from './modules/patient-record/PatientRecordService';
import {
    PatientRecord,
    PatientRecordSchema,
} from './modules/patient-record/schemas/PatientRecordSchema';
import {
    PatientRecordSeries,
    PatientRecordSeriesSchema,
} from './modules/patient-record/schemas/PatientRecordSeriesSchema';
import {
    PatientUser,
    PatientUserSchema,
} from './modules/user/schemas/PatientUserSchema';

@Module({
    controllers: [PatientRecordController],
    providers: [PatientRecordService],
    imports: [
        AssistantModule,
        MongooseModule.forFeature([
            { name: PatientUser.name, schema: PatientUserSchema },
            { name: PatientRecord.name, schema: PatientRecordSchema },
            {
                name: PatientRecordSeries.name,
                schema: PatientRecordSeriesSchema,
            },
        ]),
    ],
    exports: [MongooseModule, PatientRecordService],
})
export class PatientRecordsModule {}
