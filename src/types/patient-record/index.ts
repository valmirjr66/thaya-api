import { SERIES_TYPES } from 'src/constants';

export type SeriesType = (typeof SERIES_TYPES)[number];

export type Series = {
    id: string;
    title: string;
    type: SeriesType;
    records: { id: string; datetime: Date; value: number }[];
};

export type UnidentifiedSeries = {
    title: string;
    type: SeriesType;
    records: { datetime: Date; value: number }[];
};
