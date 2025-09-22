import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import BaseSchema from '../../../BaseSchema';

export type FileMetadataDocument = HydratedDocument<FileMetadata>;

export class FileMetadata extends BaseSchema {
    @Prop({ required: true })
    downloadURL: string;

    @Prop({ required: true })
    displayName: string;

    @Prop()
    previewImageURL: string;
}

export const FileMetadataSchema = SchemaFactory.createForClass(FileMetadata);
