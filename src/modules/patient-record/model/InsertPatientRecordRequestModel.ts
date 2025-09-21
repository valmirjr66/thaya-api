import { SeriesType } from 'src/types/patient-record';

export default class InsertPatientRecordRequestModel {
    constructor(
        public doctorId: string,
        public patientId: string,
        public sumary: string,
        public content: string,
        public series: {
            title: string;
            type: SeriesType;
            records: { datetime: Date; value: number }[];
        }[],
    ) {}
}
