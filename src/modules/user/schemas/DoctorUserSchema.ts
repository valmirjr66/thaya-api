import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type DoctorUserDocument = HydratedDocument<DoctorUser>;

@Schema({ timestamps: true })
export class DoctorUser extends BaseSchema {
    @Prop({ required: true })
    fullname: string;

    @Prop({ required: true })
    email: string;

    @Prop()
    profilePicFileName?: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop()
    birthdate?: string;

    @Prop()
    organziationId: mongoose.Types.ObjectId;
}

export const DoctorUserSchema = SchemaFactory.createForClass(DoctorUser);
