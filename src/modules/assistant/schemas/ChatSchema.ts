import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../BaseSchema';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat extends BaseSchema {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    threadId: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
