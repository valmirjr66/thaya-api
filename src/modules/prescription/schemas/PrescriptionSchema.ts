import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import BaseSchema from 'src/BaseSchema';
import { PRESCRIPTION_STATUS } from 'src/constants';
import { PrescriptionStatus } from 'src/types/prescription';

export type MessageDocument = HydratedDocument<Prescription>;

export class Prescription extends BaseSchema {
    @Prop({ required: true })
    doctorId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    patientId: mongoose.Types.ObjectId;

    @Prop()
    summary: string;

    @Prop()
    fileName: string;

    @Prop({
        required: true,
        enum: PRESCRIPTION_STATUS,
        default: PRESCRIPTION_STATUS[0],
    })
    status: PrescriptionStatus;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
