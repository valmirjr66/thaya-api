import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type PatientRecordDocument = HydratedDocument<PatientRecord>;

@Schema({ timestamps: true })
export class PatientRecord extends BaseSchema {
    @Prop({ required: true })
    doctorId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    patientId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    summary: string;

    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    seriesIds: mongoose.Types.ObjectId[];
}

export const PatientRecordSchema = SchemaFactory.createForClass(PatientRecord);
