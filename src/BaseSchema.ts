import { Prop } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

export abstract class BaseSchema {
    @Prop({ required: true })
    _id: ObjectId;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}
