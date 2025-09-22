import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type PatientUserDocument = HydratedDocument<PatientUser>;

export class PatientUser extends BaseSchema {
    @Prop({ type: [Types.ObjectId], required: true })
    doctorsId: Types.ObjectId[];

    @Prop({ required: true })
    fullname: string;

    @Prop()
    nickname?: string;

    @Prop({ required: true })
    email: string;

    @Prop()
    profilePicFileName?: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    birthdate: string;

    @Prop()
    telegramUserId?: number;

    @Prop()
    telegramChatId?: number;
}

export const PatientUserSchema = SchemaFactory.createForClass(PatientUser);
