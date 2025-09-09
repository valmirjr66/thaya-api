import { MONTHS_ABBREVIATION } from 'src/constants';

export type Occurrence = {
    id: string;
    datetime: Date;
    description: string;
};

export type AbbreviatedMonth = (typeof MONTHS_ABBREVIATION)[number];
