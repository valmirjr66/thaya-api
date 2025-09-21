import { Series } from 'src/types/patient-record';

export default class InsertPatientRecordRequestModel {
    constructor(
        public doctorId: string,
        public patientId: string,
        public summary: string,
        public content: string,
        public series: Omit<Series, 'id'>[],
    ) {}
}
