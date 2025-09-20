import { MONTHS_ABBREVIATION } from 'src/constants';

export type Occurrence = {
    id: string;
    patientId: string;
    datetime: Date;
    description: string;
    patientName: string;
};

export type AbbreviatedMonth = (typeof MONTHS_ABBREVIATION)[number];
