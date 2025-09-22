import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MessageRole } from 'src/types/gpt';
import BaseSchema from '../../../BaseSchema';
import { FileMetadata } from './FileMetadataSchema';

export type MessageDocument = HydratedDocument<Message>;

export class Message extends BaseSchema {
    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    role: MessageRole;

    @Prop({ required: true })
    chatId: mongoose.Types.ObjectId;

    @Prop()
    references: FileMetadata[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
