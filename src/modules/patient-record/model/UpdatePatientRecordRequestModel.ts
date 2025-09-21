import { Injectable } from '@nestjs/common';
import { SeriesType } from 'src/types/patient-record';

@Injectable()
export default class UpdatePatientRecordRequestModel {
    constructor(
        public id: string,
        public sumary: string,
        public content: string,
        public series: {
            title: string;
            type: SeriesType;
            records: { datetime: Date; value: number }[];
        }[],
    ) {}
}
