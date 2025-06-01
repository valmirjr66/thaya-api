import { Injectable, Logger } from '@nestjs/common';
import { Occurrence } from 'src/types/calendar';

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
            from: { month: number; year: number };
            to: { month: number; year: number };
        },
    ): Promise<Occurrence[]> {
        const { from, to } = args;

        if (
            !from ||
            !to ||
            typeof from.month !== 'number' ||
            typeof from.year !== 'number' ||
            typeof to.month !== 'number' ||
            typeof to.year !== 'number'
        ) {
            throw new Error('Invalid date range');
        }

        this.logger.log(
            `Fetching user's agenda with following args: ${JSON.stringify(args)}`,
        );

        const fromDate = new Date(from.year, from.month - 1);
        const toDate = new Date(to.year, to.month - 1);

        if (fromDate > toDate) {
            throw new Error('"from" date must be before or equal to "to" date');
        }

        const fetches: Promise<any>[] = [];

        let currentYear = from.year;
        let currentMonth = from.month - 1;

        while (
            currentYear < to.year ||
            (currentYear === to.year && currentMonth <= to.month)
        ) {
            const url = `${process.env.USER_MODULE_ADDRESS}/calendar?month=${currentMonth}&year=${currentYear}`;

            fetches.push(
                fetch(url, {
                    headers: { 'x-user-email': userEmail },
                }).then(async (res) => {
                    if (res.status === 204) {
                        return {
                            items: [],
                        };
                    }

                    if (!res.ok) {
                        throw new Error(
                            `Failed to fetch calendar for ${currentMonth}/${currentYear}`,
                        );
                    }

                    return res.json();
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
