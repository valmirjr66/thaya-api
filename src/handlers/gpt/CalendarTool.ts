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
        const { from, to } = args;

        if (
            !from ||
            !to ||
            !MONTHS_ABBREVIATION.includes(from.month) ||
            typeof from.year !== 'string' ||
            !MONTHS_ABBREVIATION.includes(to.month) ||
            typeof to.year !== 'number'
        ) {
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

            fetches.push(
                axios
                    .get(url, {
                        headers: { 'x-user-email': userEmail },
                        validateStatus: () => true,
                    })
                    .then(({ data, status }) => {
                        if (status === 204) {
                            return {
                                items: [],
                            };
                        }

                        if (status < 200 || status >= 300) {
                            throw new Error(
                                `Failed to fetch calendar for ${currentMonth}/${currentYear}`,
                            );
                        }

                        return data;
                    }),
            );

            currentMonth++;

            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }

        const occurrences: Occurrence[] = [];

        const results = (await Promise.all(fetches)) as {
            items: Occurrence[];
        }[];

        for (const result of results) {
            if (result) {
                if (result.items.length) {
                    occurrences.push(...result.items);
                }
            }
        }

        return occurrences;
    }
}
