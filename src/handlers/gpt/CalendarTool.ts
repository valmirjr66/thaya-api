import { Injectable, Logger } from '@nestjs/common';
import { MONTHS_ABBREVIATION } from 'src/constants';
import CalendarService from 'src/modules/user/CalendarService';
import GetUserCalendarResponseModel from 'src/modules/user/model/GetUserCalendarResponseModel';
import { AbbreviatedMonth, Occurrence } from 'src/types/calendar';
import CalendarUtils from 'src/utils/CalendarUtils';

@Injectable()
export default class CalendarTool {
    private readonly logger: Logger = new Logger('CalendarTool');

    constructor(private readonly calendarService: CalendarService) {}

    async getCurrentDatetime() {
        const currentDatetime = new Date();
        this.logger.log(`Fetching current datetime: ${currentDatetime}`);

        return { currentDatetime };
    }

    async getUserAgenda(
        userEmail: string,
        args: {
            from: { month: AbbreviatedMonth; year: number };
            to: { month: AbbreviatedMonth; year: number };
        },
    ): Promise<Occurrence[]> {
        this.logger.debug('Entering getUserAgenda');
        const { from, to } = args;

        if (
            !from ||
            !to ||
            !MONTHS_ABBREVIATION.includes(from.month) ||
            typeof from.year !== 'number' ||
            !MONTHS_ABBREVIATION.includes(to.month) ||
            typeof to.year !== 'number'
        ) {
            this.logger.error('Invalid date range', { from, to });
            throw new Error('Invalid date range');
        }

        this.logger.log(
            `Fetching user's agenda with following args: ${JSON.stringify(args)}`,
        );

        const fromDate = new Date(
            from.year,
            CalendarUtils.mapMonthAbbreviationToNumber(from.month),
        );

        const toDate = new Date(
            to.year,
            CalendarUtils.mapMonthAbbreviationToNumber(to.month),
        );

        if (fromDate > toDate) {
            this.logger.error(
                '"from" date must be before or equal to "to" date',
                { fromDate, toDate },
            );
            throw new Error('"from" date must be before or equal to "to" date');
        }

        const fetches: Promise<GetUserCalendarResponseModel>[] = [];

        let currentYear = from.year;
        let currentMonthNumber = CalendarUtils.mapMonthAbbreviationToNumber(
            from.month,
        );

        while (
            currentYear < to.year ||
            (currentYear === to.year &&
                currentMonthNumber <=
                    CalendarUtils.mapMonthAbbreviationToNumber(to.month))
        ) {
            fetches.push(
                this.fetchCalendar(
                    userEmail,
                    CalendarUtils.mapNumberToMonthAbbreviation(
                        currentMonthNumber,
                    ),
                    currentYear,
                ).catch((error) => {
                    this.logger.error(
                        `Error fetching calendar for ${currentMonthNumber}/${currentYear}: ${error.message}`,
                    );
                    throw error;
                }),
            );

            currentMonthNumber++;

            if (currentMonthNumber > 11) {
                currentMonthNumber = 0;
                currentYear++;
            }
        }

        const occurrences: Occurrence[] = [];

        let results: { items: Occurrence[] }[] = [];
        try {
            results = await Promise.all(fetches);

            this.logger.debug(
                `Fetched all calendar results: ${JSON.stringify(results)}`,
            );
        } catch (error) {
            this.logger.error(
                `Error in Promise.all(fetches): ${error.message}`,
            );
            throw error;
        }

        for (const result of results) {
            if (result) {
                if (result.items.length) {
                    occurrences.push(...result.items);
                }
            }
        }

        this.logger.log(`Returning ${occurrences.length} occurrences`);

        return occurrences;
    }

    private async fetchCalendar(
        userEmail: string,
        month: AbbreviatedMonth,
        year: number,
    ): Promise<GetUserCalendarResponseModel> {
        const userCalendar = await this.calendarService.getUserCalendarByEmail(
            userEmail,
            month,
            year,
        );

        if (!userCalendar.items) {
            this.logger.debug(`No items for ${month}/${year}`);
        }

        return userCalendar;
    }
}
