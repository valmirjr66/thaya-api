import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type ThayaMDChatDocument = HydratedDocument<ThayaMDChat>;

@Schema({ timestamps: true })
export class ThayaMDChat extends BaseSchema {
    @Prop({ required: true })
    userId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    threadId: string;
}

export const ThayaMDChatSchema = SchemaFactory.createForClass(ThayaMDChat);
