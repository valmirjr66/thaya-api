import { SeriesType } from 'src/types/patient-record';

export default class GetPatientRecordResponseModel {
    constructor(
        public id: string,
        public doctorId: string,
        public patientId: string,
        public summary: string,
        public content: string,
        public series: {
            title: string;
            type: SeriesType;
            records: { datetime: Date; value: number }[];
        }[],
    ) {}
}
