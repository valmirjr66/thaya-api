export class GetCalendarOccurrenceResponseModel {
    constructor(
        public id: string,
        public patientId: string,
        public patientName: string,
        public datetime: Date,
        public description: string,
    ) {}
}
