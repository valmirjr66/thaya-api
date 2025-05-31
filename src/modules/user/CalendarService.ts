import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Occurrence } from 'src/types/calendar';
import BaseService from '../../BaseService';
import GetUserCalendarResponseModel from './model/GetUserCalendarResponseModel';
import { Calendar } from './schemas/CalendarSchema';

@Injectable()
export default class CalendarService extends BaseService {
    private readonly logger: Logger = new Logger('CalendarService');

    constructor(
        @InjectModel(Calendar.name)
        private readonly calendarModel: Model<Calendar>,
    ) {
        super();
    }

    async getUserCalendarByEmail(
        userEmail: string,
        month: number,
        year: number,
    ): Promise<GetUserCalendarResponseModel | null> {
        this.logger.log(`Fetching user calendar for email: ${userEmail}`);

        const userCalendar = await this.calendarModel
            .find({ userEmail })
            .exec();

        this.logger.log(
            `For user with email ${userEmail} found ${userCalendar.length} records`,
        );

        if (!userCalendar) {
            return new GetUserCalendarResponseModel([]);
        }

        const filteredRecords = userCalendar
            .map((item) => item.record as Occurrence)
            .filter((item) => {
                return (
                    item.datetime.getUTCFullYear() === year &&
                    item.datetime.getUTCMonth() === month
                );
            });

        this.logger.log(
            `For user with email ${userEmail} got ${filteredRecords.length} records filtering by month ${month} and year ${year}`,
        );

        return new GetUserCalendarResponseModel(filteredRecords);
    }
}
