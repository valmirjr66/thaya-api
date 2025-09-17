import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role, UserChatOrigin } from 'src/types/gpt';
import BaseSchema from '../../../BaseSchema';
import { FileMetadata } from './FileMetadataSchema';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message extends BaseSchema {
    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    role: Role;

    @Prop({ required: true })
    chatId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    userChatOrigin: UserChatOrigin;

    @Prop()
    references: FileMetadata[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
