export default class InsertCalendarOccurenceRequestDto {
    constructor(
        public datetime: Date,
        public description: string,
    ) {}
}
