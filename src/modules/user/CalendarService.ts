import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AbbreviatedMonth, Occurrence } from 'src/types/calendar';
import CalendarUtils from 'src/utils/CalendarUtils';
import BaseService from '../../BaseService';
import GetUserCalendarResponseModel from './model/GetUserCalendarResponseModel';
import InsertCalendarOccurenceRequestModel from './model/InsertCalendarOccurenceRequestModel';
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
        month: AbbreviatedMonth,
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

        const monthNumber = CalendarUtils.mapMonthAbbreviationToNumber(month);

        const filteredRecords = userCalendar
            .map((item) => item.record as Occurrence)
            .filter((item) => {
                return (
                    item.datetime.getUTCFullYear() === year &&
                    item.datetime.getUTCMonth() === monthNumber
                );
            });

        this.logger.log(
            `For user with email ${userEmail} got ${filteredRecords.length} records filtering by month '${month}' and year '${year}'`,
        );

        return new GetUserCalendarResponseModel(filteredRecords);
    }

    async insertCalendarOccurrence(model: InsertCalendarOccurenceRequestModel) {
        this.logger.log(
            `Insert calendar occurrence for user with email ${model.userEmail}`,
        );

        const { userEmail, datetime, description } = model;

        await this.calendarModel.create({
            _id: new mongoose.Types.ObjectId(),
            record: {
                datetime,
                description,
            },
            userEmail,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}
