export default class InsertCalendarOccurenceRequestModel {
    constructor(
        public userId: string,
        public datetime: Date,
        public description: string,
    ) {}
}
