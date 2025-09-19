export default class UpdateCalendarOccurenceRequestDto {
    constructor(
        public patientId: string,
        public datetime: Date,
        public description: string,
    ) {}
}
