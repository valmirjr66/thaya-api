import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type DoctorUserDocument = HydratedDocument<DoctorUser>;

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
    birthdate: string;

    @Prop({ required: true })
    organizationId: mongoose.Types.ObjectId;
}

export const DoctorUserSchema = SchemaFactory.createForClass(DoctorUser);
