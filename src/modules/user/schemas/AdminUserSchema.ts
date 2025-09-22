import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type UserDocument = HydratedDocument<AdminUser>;

export class AdminUser extends BaseSchema {
    @Prop({ required: true })
    fullname: string;

    @Prop({ required: true })
    email: string;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
