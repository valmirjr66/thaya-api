import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CalendarController from './modules/calendar/CalendarController';
import CalendarService from './modules/calendar/CalendarService';
import {
    Calendar,
    CalendarSchema,
} from './modules/calendar/schemas/CalendarSchema';

@Module({
    controllers: [CalendarController],
    providers: [CalendarService],
    imports: [
        MongooseModule.forFeature([
            { name: Calendar.name, schema: CalendarSchema },
        ]),
    ],
    exports: [CalendarService, MongooseModule],
})
export class CalendarModule {}
