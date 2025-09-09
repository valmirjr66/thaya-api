import {
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AbbreviatedMonth, Occurrence } from 'src/types/calendar';
import CalendarUtils from 'src/utils/CalendarUtils';
import BaseService from '../../BaseService';
import GetUserCalendarResponseModel from './model/GetUserCalendarResponseModel';
import InsertCalendarOccurenceRequestModel from './model/InsertCalendarOccurenceRequestModel';
import UpdateCalendarOccurenceRequestModel from './model/UpdateCalendarOccurenceRequestModel';
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
        this.logger.log(
            `[getUserCalendarByEmail] Fetching calendar for email: ${userEmail}, month: ${month}, year: ${year}`,
        );

        try {
            const userCalendar = await this.calendarModel
                .find({ userEmail })
                .exec();

            this.logger.debug(
                `[getUserCalendarByEmail] Raw records: ${JSON.stringify(userCalendar)}`,
            );

            this.logger.log(
                `[getUserCalendarByEmail] Found ${userCalendar.length} records for user ${userEmail}`,
            );

            if (!userCalendar) {
                this.logger.warn(
                    `[getUserCalendarByEmail] No calendar records found for user ${userEmail}`,
                );
                return new GetUserCalendarResponseModel([]);
            }

            const monthNumber =
                CalendarUtils.mapMonthAbbreviationToNumber(month);

            const filteredRecords = userCalendar
                .map(
                    (item) =>
                        ({
                            id: item.id,
                            datetime: item.toObject().datetime,
                            description: item.toObject().description,
                        }) as Occurrence,
                )
                .filter((item) => {
                    const match =
                        item.datetime.getUTCFullYear() === year &&
                        item.datetime.getUTCMonth() === monthNumber;
                    this.logger.debug(
                        `[getUserCalendarByEmail] Checking record: ${JSON.stringify(item)}, match: ${match}`,
                    );
                    return match;
                });

            this.logger.log(
                `[getUserCalendarByEmail] Filtered ${filteredRecords.length} records for month '${month}' and year '${year}'`,
            );

            return new GetUserCalendarResponseModel(filteredRecords);
        } catch (error) {
            this.logger.error(
                `[getUserCalendarByEmail] Error fetching calendar for ${userEmail}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    async insertCalendarOccurrence(model: InsertCalendarOccurenceRequestModel) {
        this.logger.log(
            `[insertCalendarOccurrence] Inserting occurrence for user: ${model.userEmail}, datetime: ${model.datetime}, description: ${model.description}`,
        );

        try {
            const { userEmail, datetime, description } = model;

            const newOccurrence = {
                _id: new mongoose.Types.ObjectId(),
                datetime,
                description,
                userEmail,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            this.logger.debug(
                `[insertCalendarOccurrence] Occurrence payload: ${JSON.stringify(newOccurrence)}`,
            );

            await this.calendarModel.create(newOccurrence);

            this.logger.log(
                `[insertCalendarOccurrence] Successfully inserted occurrence for user: ${userEmail}`,
            );
        } catch (error) {
            this.logger.error(
                `[insertCalendarOccurrence] Error inserting occurrence for ${model.userEmail}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    async deleteCalendarOccurrence(
        id: string,
        userEmail: string,
    ): Promise<void> {
        this.logger.log(
            `[deleteCalendarOccurrence] Deleting occurrence with id: ${id} for user: ${userEmail}`,
        );

        try {
            const occurrence = await this.calendarModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec();

            if (!occurrence) {
                this.logger.warn(
                    `[deleteCalendarOccurrence] No occurrence found with id: ${id}`,
                );
                throw new NotFoundException();
            }

            if (occurrence.userEmail !== userEmail) {
                this.logger.warn(
                    `[deleteCalendarOccurrence] Unauthorized delete attempt for occurrence id: ${id} by user: ${userEmail}`,
                );
                throw new UnauthorizedException();
            }

            await this.calendarModel.deleteOne({
                _id: new mongoose.Types.ObjectId(id),
            });

            this.logger.log(
                `[deleteCalendarOccurrence] Successfully deleted occurrence with id: ${id} for user: ${userEmail}`,
            );
        } catch (error) {
            this.logger.error(
                `[deleteCalendarOccurrence] Error deleting occurrence with id: ${id} for user: ${userEmail}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    async updateCalendarOccurrence(
        model: UpdateCalendarOccurenceRequestModel,
    ): Promise<void> {
        const { id, userEmail, datetime, description } = model;

        this.logger.log(
            `[updateCalendarOccurrence] Updating occurrence with id: ${id} for user: ${userEmail}`,
        );

        try {
            const occurrence = await this.calendarModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec();

            if (!occurrence) {
                this.logger.warn(
                    `[updateCalendarOccurrence] No occurrence found with id: ${id}`,
                );
                throw new NotFoundException();
            }

            if (occurrence.userEmail !== userEmail) {
                this.logger.warn(
                    `[updateCalendarOccurrence] Unauthorized update attempt for occurrence id: ${id} by user: ${userEmail}`,
                );
                throw new UnauthorizedException();
            }

            const updatedFields: Partial<Calendar> = {
                updatedAt: new Date(),
                datetime,
                description,
            };

            this.logger.debug(
                `[updateCalendarOccurrence] Updated fields: ${JSON.stringify(
                    updatedFields,
                )}`,
            );

            await this.calendarModel.updateOne(
                { _id: new mongoose.Types.ObjectId(id), userEmail },
                { $set: { ...updatedFields } },
            );

            this.logger.log(
                `[updateCalendarOccurrence] Successfully updated occurrence with id: ${id} for user: ${userEmail}`,
            );
        } catch (error) {
            this.logger.error(
                `[updateCalendarOccurrence] Error updating occurrence with id: ${model.id} for user: ${model.userEmail}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }
}
