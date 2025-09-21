import { SERIES_TYPES } from 'src/constants';

export type SeriesType = (typeof SERIES_TYPES)[number];

export type Series = {
    id: string;
    title: string;
    type: SeriesType;
    records: { datetime: Date; value: number }[];
};
