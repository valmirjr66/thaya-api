import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AbbreviatedMonth, Occurrence } from 'src/types/calendar';
import CalendarUtils from 'src/utils/CalendarUtils';
import GetUserCalendarResponseModel from './model/GetUserCalendarResponseModel';
import InsertCalendarOccurenceRequestModel from './model/InsertCalendarOccurenceRequestModel';
import UpdateCalendarOccurenceRequestModel from './model/UpdateCalendarOccurenceRequestModel';
import { Calendar } from './schemas/CalendarSchema';

@Injectable()
export default class CalendarService {
    private readonly logger: Logger = new Logger('CalendarService');

    constructor(
        @InjectModel(Calendar.name)
        private readonly calendarModel: Model<Calendar>,
    ) {}

    async getUserCalendarByUserId(
        userId: string,
        month: AbbreviatedMonth,
        year: number,
    ): Promise<GetUserCalendarResponseModel | null> {
        this.logger.log(
            `[getUserCalendarByUserId] Fetching calendar for user: ${userId}, month: ${month}, year: ${year}`,
        );

        try {
            const userCalendar = await this.calendarModel
                .find({ userId: new mongoose.Types.ObjectId(userId) })
                .exec();

            this.logger.debug(
                `[getUserCalendarByUserId] Raw records: ${JSON.stringify(userCalendar)}`,
            );

            this.logger.log(
                `[getUserCalendarByUserId] Found ${userCalendar.length} records for user ${userId}`,
            );

            if (!userCalendar) {
                this.logger.warn(
                    `[getUserCalendarByUserId] No calendar records found for user ${userId}`,
                );
                return new GetUserCalendarResponseModel([]);
            }

            const monthNumber =
                CalendarUtils.mapMonthAbbreviationToNumber(month);

            const filteredRecords = userCalendar
                .map((item) => item.toObject())
                .map(
                    (item) =>
                        ({
                            id: item._id.toString(),
                            datetime: item.datetime,
                            description: item.description,
                            patientId: item.patientId.toString(),
                        }) as Occurrence,
                )
                .filter((item) => {
                    const match =
                        item.datetime.getUTCFullYear() === year &&
                        item.datetime.getUTCMonth() === monthNumber;
                    this.logger.debug(
                        `[getUserCalendarByUserId] Checking record: ${JSON.stringify(item)}, match: ${match}`,
                    );
                    return match;
                });

            this.logger.log(
                `[getUserCalendarByUserId] Filtered ${filteredRecords.length} records for month '${month}' and year '${year}'`,
            );

            return new GetUserCalendarResponseModel(filteredRecords);
        } catch (error) {
            this.logger.error(
                `[getUserCalendarByUserId] Error fetching calendar for ${userId}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    async insertCalendarOccurrence(model: InsertCalendarOccurenceRequestModel) {
        this.logger.log(
            `[insertCalendarOccurrence] Inserting occurrence for user: ${model.userId}, datetime: ${model.datetime}, description: ${model.description}`,
        );

        try {
            const { userId, datetime, description } = model;

            const newOccurrence = {
                _id: new mongoose.Types.ObjectId(),
                datetime,
                description,
                userId: new mongoose.Types.ObjectId(userId),
                patientId: new mongoose.Types.ObjectId(model.patientId),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            this.logger.debug(
                `[insertCalendarOccurrence] Occurrence payload: ${JSON.stringify(newOccurrence)}`,
            );

            await this.calendarModel.create(newOccurrence);

            this.logger.log(
                `[insertCalendarOccurrence] Successfully inserted occurrence for user: ${userId}`,
            );
        } catch (error) {
            this.logger.error(
                `[insertCalendarOccurrence] Error inserting occurrence for user ${model.userId}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    async deleteCalendarOccurrence(id: string): Promise<void> {
        this.logger.log(
            `[deleteCalendarOccurrence] Deleting occurrence with id: ${id}`,
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

            await this.calendarModel.deleteOne({
                _id: new mongoose.Types.ObjectId(id),
            });

            this.logger.log(
                `[deleteCalendarOccurrence] Successfully deleted occurrence with id: ${id}`,
            );
        } catch (error) {
            this.logger.error(
                `[deleteCalendarOccurrence] Error deleting occurrence with id: ${id}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    async updateCalendarOccurrence(
        model: UpdateCalendarOccurenceRequestModel,
    ): Promise<void> {
        const { id, datetime, description } = model;

        this.logger.log(
            `[updateCalendarOccurrence] Updating occurrence with id: ${id}`,
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
                { _id: new mongoose.Types.ObjectId(id) },
                { $set: { ...updatedFields } },
            );

            this.logger.log(
                `[updateCalendarOccurrence] Successfully updated occurrence with id: ${id}`,
            );
        } catch (error) {
            this.logger.error(
                `[updateCalendarOccurrence] Error updating occurrence with id: ${model.id}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }
}
