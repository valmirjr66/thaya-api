import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { MONTHS_ABBREVIATION } from 'src/constants';
import { AbbreviatedMonth, Occurrence } from 'src/types/calendar';
import CalendarUtils from 'src/utils/CalendarUtils';

@Injectable()
export default class CalendarTool {
    private readonly logger: Logger = new Logger('CalendarTool');

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

        const fetches: Promise<any>[] = [];

        let currentYear = from.year;
        let currentMonth = CalendarUtils.mapMonthAbbreviationToNumber(
            from.month,
        );

        while (
            currentYear < to.year ||
            (currentYear === to.year &&
                currentMonth <=
                    CalendarUtils.mapMonthAbbreviationToNumber(to.month))
        ) {
            const url = `${process.env.USER_MODULE_ADDRESS}/calendar?month=${currentMonth}&year=${currentYear}`;
            this.logger.debug(`Constructed URL: ${url}`);

            fetches.push(
                axios
                    .get(url, {
                        headers: { 'x-user-email': userEmail },
                        validateStatus: () => true,
                    })
                    .then(({ data, status }) => {
                        this.logger.debug(
                            `Fetch result for ${currentMonth}/${currentYear}: status=${status}`,
                        );
                        if (status === 204) {
                            this.logger.debug(
                                `No items for ${currentMonth}/${currentYear}`,
                            );
                            return {
                                items: [],
                            };
                        }

                        if (status < 200 || status >= 300) {
                            this.logger.error(
                                `Failed to fetch calendar for ${currentMonth}/${currentYear}: status=${status}`,
                            );
                            throw new Error(
                                `Failed to fetch calendar for ${currentMonth}/${currentYear}`,
                            );
                        }

                        this.logger.debug(
                            `Fetched data for ${currentMonth}/${currentYear}: ${JSON.stringify(data)}`,
                        );
                        return data;
                    })
                    .catch((error) => {
                        this.logger.error(
                            `Error fetching calendar for ${currentMonth}/${currentYear}: ${error.message}`,
                        );
                        throw error;
                    }),
            );

            currentMonth++;

            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }

        const occurrences: Occurrence[] = [];

        let results: { items: Occurrence[] }[] = [];
        try {
            results = (await Promise.all(fetches)) as {
                items: Occurrence[];
            }[];
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
}
