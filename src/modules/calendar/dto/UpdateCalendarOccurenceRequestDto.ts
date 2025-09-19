export default class UpdateCalendarOccurenceRequestDto {
    constructor(
        public datetime: Date,
        public description: string,
    ) {}
}
