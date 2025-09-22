import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type ThayaConnectChatDocument = HydratedDocument<ThayaConnectChat>;

export class ThayaConnectChat extends BaseSchema {
    @Prop({ required: true })
    userId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    threadId: string;
}

export const ThayaConnectChatSchema =
    SchemaFactory.createForClass(ThayaConnectChat);
