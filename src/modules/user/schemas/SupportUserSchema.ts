import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type SupportUserDocument = HydratedDocument<SupportUser>;

@Schema({ timestamps: true })
export class SupportUser extends BaseSchema {
    @Prop({ required: true })
    fullname: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    organizationId: mongoose.Types.ObjectId;

    @Prop()
    profilePicFileName?: string;
}

export const SupportUserSchema = SchemaFactory.createForClass(SupportUser);
