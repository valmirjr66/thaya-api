import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from 'src/types/user';
import BaseSchema from '../../../BaseSchema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends BaseSchema {
    @Prop({ required: true })
    fullname: string;

    @Prop()
    nickname?: string;

    @Prop({ required: true })
    role: UserRole;

    @Prop({ required: true })
    email: string;

    @Prop()
    profilePicFileName?: string;

    @Prop()
    phoneNumber?: string;

    @Prop()
    birthdate?: string;

    @Prop()
    telegramUserId?: number;

    telegramChatId?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
