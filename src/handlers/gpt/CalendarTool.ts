import { Injectable } from '@nestjs/common';

export type Occurrence = {
    time: Date;
    description: string;
};

export type Day = {
    date: Date;
    occurrences: Occurrence[];
};

export type Month = {
    number: number;
    days: Day[];
};

const calendar: Record<string, Month> = {
    '2025-01': {
        number: 1,
        days: [
            {
                date: new Date('2025-01-10'),
                occurrences: [
                    {
                        time: new Date('2025-01-10T10:00:00'),
                        description: 'New Year team planning',
                    },
                ],
            },
        ],
    },
    '2025-02': {
        number: 2,
        days: [
            {
                date: new Date('2025-02-14'),
                occurrences: [
                    {
                        time: new Date('2025-02-14T20:00:00'),
                        description: 'Valentine dinner',
                    },
                ],
            },
        ],
    },
    '2025-03': {
        number: 3,
        days: [
            {
                date: new Date('2025-03-05'),
                occurrences: [
                    {
                        time: new Date('2025-03-05T15:00:00'),
                        description: 'Budget review',
                    },
                ],
            },
        ],
    },
    '2025-04': {
        number: 4,
        days: [
            {
                date: new Date('2025-04-22'),
                occurrences: [
                    {
                        time: new Date('2025-04-22T09:00:00'),
                        description: 'Earth Day campaign',
                    },
                ],
            },
        ],
    },
    '2025-05': {
        number: 5,
        days: [
            {
                date: new Date('2025-05-12'),
                occurrences: [
                    {
                        time: new Date('2025-05-12T13:00:00'),
                        description: 'Team outing',
                    },
                ],
            },
        ],
    },
    '2025-06': {
        number: 6,
        days: [
            {
                date: new Date('2025-06-01'),
                occurrences: [
                    {
                        time: new Date('2025-06-01T09:00:00'),
                        description: 'Meeting with team',
                    },
                    {
                        time: new Date('2025-06-01T14:00:00'),
                        description: 'Doctor appointment',
                    },
                ],
            },
            {
                date: new Date('2025-06-02'),
                occurrences: [
                    {
                        time: new Date('2025-06-02T11:00:00'),
                        description: 'Project deadline',
                    },
                ],
            },
        ],
    },
    '2025-07': {
        number: 7,
        days: [
            {
                date: new Date('2025-07-04'),
                occurrences: [
                    {
                        time: new Date('2025-07-04T18:00:00'),
                        description: 'Independence Day BBQ',
                    },
                ],
            },
        ],
    },
    '2025-08': {
        number: 8,
        days: [
            {
                date: new Date('2025-08-15'),
                occurrences: [
                    {
                        time: new Date('2025-08-15T10:00:00'),
                        description: 'Mid-year review',
                    },
                ],
            },
        ],
    },
    '2025-09': {
        number: 9,
        days: [
            {
                date: new Date('2025-09-01'),
                occurrences: [
                    {
                        time: new Date('2025-09-01T08:00:00'),
                        description: 'Back to work after break',
                    },
                ],
            },
        ],
    },
    '2025-10': {
        number: 10,
        days: [
            {
                date: new Date('2025-10-31'),
                occurrences: [
                    {
                        time: new Date('2025-10-31T19:00:00'),
                        description: 'Halloween party',
                    },
                ],
            },
        ],
    },
    '2025-11': {
        number: 11,
        days: [
            {
                date: new Date('2025-11-24'),
                occurrences: [
                    {
                        time: new Date('2025-11-24T16:00:00'),
                        description: 'Thanksgiving prep',
                    },
                ],
            },
        ],
    },
    '2025-12': {
        number: 12,
        days: [
            {
                date: new Date('2025-12-25'),
                occurrences: [
                    {
                        time: new Date('2025-12-25T00:00:00'),
                        description: 'Christmas celebration',
                    },
                ],
            },
        ],
    },
};

@Injectable()
export default class CalendarTool {
    async getUserAgenda(args: { from: string; to: string }): Promise<Day[]> {
        const from = new Date(args.from);
        const to = new Date(args.to);

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            throw new Error('Invalid date format. Please use ISO 8601 format.');
        }

        const fromYear = from.getFullYear();
        const fromMonth = from.getMonth() + 1;

        const toYear = to.getFullYear();
        const toMonth = to.getMonth() + 1;

        const days: Day[] = [];

        for (let year = fromYear; year <= toYear; year++) {
            const startMonth = year === fromYear ? fromMonth : 1;
            const endMonth = year === toYear ? toMonth : 12;

            for (let month = startMonth; month <= endMonth; month++) {
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;
                const monthData = calendar[monthKey];

                if (monthData) {
                    for (const day of monthData.days) {
                        if (day.date >= from && day.date <= to) {
                            days.push(day);
                        }
                    }
                }
            }
        }

        return days;
    }
}
