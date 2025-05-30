import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../BaseSchema';

export type CalendarDocument = HydratedDocument<Calendar>;

@Schema({ timestamps: true, _id: false })
class Occurrence {
    @Prop({ required: true })
    datetime: Date;

    @Prop({ required: true })
    description: string;
}

const OccurrenceSchema = SchemaFactory.createForClass(Occurrence);

@Schema({ timestamps: true })
export class Calendar extends BaseSchema {
    @Prop({ required: true })
    userEmail: string;

    @Prop({
        type: OccurrenceSchema,
        required: true,
    })
    record: Occurrence;
}

export const CalendarSchema = SchemaFactory.createForClass(Calendar);
