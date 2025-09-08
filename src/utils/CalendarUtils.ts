import { MONTHS_ABBREVIATION } from 'src/constants';
import { AbbreviatedMonth } from 'src/types/calendar';

export default class CalendarUtils {
    static mapMonthAbbreviationToNumber(month: AbbreviatedMonth): number {
        const monthMap: Record<string, number> = {
            jan: 0,
            feb: 1,
            mar: 2,
            apr: 3,
            may: 4,
            jun: 5,
            jul: 6,
            aug: 7,
            sep: 8,
            oct: 9,
            nov: 10,
            dec: 11,
        };

        return monthMap[month];
    }

    static mapNumberToMonthAbbreviation(monthNumber: number): AbbreviatedMonth {
        return MONTHS_ABBREVIATION[monthNumber];
    }
}
