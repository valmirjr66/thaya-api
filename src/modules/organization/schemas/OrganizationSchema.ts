import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CollaboratorRole } from 'src/types/user';
import BaseSchema from '../../../BaseSchema';

export type OrganizationDocument = HydratedDocument<Organization>;

export class Organization extends BaseSchema {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    collaborators: {
        id: mongoose.Types.ObjectId;
        role: CollaboratorRole;
    }[];

    @Prop({ required: true })
    phoneNumber: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    timezoneOffset: number;

    @Prop()
    profilePicFileName?: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
