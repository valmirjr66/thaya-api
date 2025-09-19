import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type CalendarDocument = HydratedDocument<Calendar>;

@Schema({ timestamps: true })
export class Calendar extends BaseSchema {
    @Prop({ required: true })
    userId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    patientId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    datetime: Date;

    @Prop({ required: true })
    description: string;
}

export const CalendarSchema = SchemaFactory.createForClass(Calendar);
