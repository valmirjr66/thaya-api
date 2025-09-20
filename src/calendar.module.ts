import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CalendarController from './modules/calendar/CalendarController';
import CalendarService from './modules/calendar/CalendarService';
import {
    Calendar,
    CalendarSchema,
} from './modules/calendar/schemas/CalendarSchema';
import {
    PatientUser,
    PatientUserSchema,
} from './modules/user/schemas/PatientUserSchema';

@Module({
    controllers: [CalendarController],
    providers: [CalendarService],
    imports: [
        MongooseModule.forFeature([
            { name: Calendar.name, schema: CalendarSchema },
            { name: PatientUser.name, schema: PatientUserSchema },
        ]),
    ],
    exports: [CalendarService, MongooseModule],
})
export class CalendarModule {}
