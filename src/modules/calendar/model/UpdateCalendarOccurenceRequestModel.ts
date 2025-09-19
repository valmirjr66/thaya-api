export default class UpdateCalendarOccurenceRequestModel {
    constructor(
        public id: string,
        public datetime: Date,
        public description: string,
    ) {}
}
