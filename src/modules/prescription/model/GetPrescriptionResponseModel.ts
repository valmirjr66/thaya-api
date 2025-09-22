import { PrescriptionStatus } from 'src/types/prescription';

export default class GetPrescriptionResponseModel {
    constructor(
        public id: string,
        public doctorId: string,
        public patientId: string,
        public status: PrescriptionStatus,
        public createdAt: Date,
        public updatedAt: Date,
        public fileName?: string,
        public summary?: string,
    ) {}
}
