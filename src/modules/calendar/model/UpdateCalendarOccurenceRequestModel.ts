export default class UpdateCalendarOccurenceRequestModel {
    constructor(
        public id: string,
        public patientId: string,
        public datetime: Date,
        public description: string,
    ) {}
}
