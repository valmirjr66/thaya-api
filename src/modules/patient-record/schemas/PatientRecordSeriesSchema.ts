import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SeriesType } from 'src/types/patient-record';
import BaseSchema from '../../../BaseSchema';

export type PatientRecordSeriesDocument = HydratedDocument<PatientRecordSeries>;

export class PatientRecordSeries extends BaseSchema {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    type: SeriesType;

    @Prop({ required: true })
    records: { datetime: Date; value: number }[];
}

export const PatientRecordSeriesSchema =
    SchemaFactory.createForClass(PatientRecordSeries);
