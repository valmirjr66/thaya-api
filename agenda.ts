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
  "2025-06": {
    number: 6,
    days: [
      {
        date: new Date("2025-06-01"),
        occurrences: [
          {
            time: new Date("2025-06-01T09:00:00"),
            description: "Meeting with team",
          },
          {
            time: new Date("2025-06-01T14:00:00"),
            description: "Doctor appointment",
          },
        ],
      },
      {
        date: new Date("2025-06-02"),
        occurrences: [
          {
            time: new Date("2025-06-02T11:00:00"),
            description: "Project deadline",
          },
        ],
      },
    ],
  },
};

export async function getUserAgenda(args: {
  from: string;
  to: string;
}): Promise<Day[]> {
  const from = new Date(args.from);
  const to = new Date(args.to);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new Error("Invalid date format. Please use ISO 8601 format.");
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
      const monthKey = `${year}-${String(month).padStart(2, "0")}`;
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
