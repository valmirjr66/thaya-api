import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../BaseSchema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends BaseSchema {
    @Prop({ required: true })
    fullname: string;

    @Prop()
    nickname?: string;

    @Prop()
    profilePicFileName?: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop({ required: true })
    birthdate: string;

    telegramUserId?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
