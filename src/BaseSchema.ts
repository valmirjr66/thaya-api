import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export abstract class BaseSchema {
    @Prop({ required: true })
    _id: mongoose.Types.ObjectId;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}
