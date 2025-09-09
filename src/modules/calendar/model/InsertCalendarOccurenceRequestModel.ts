export default class InsertCalendarOccurenceRequestModel {
    constructor(
        public userEmail: string,
        public datetime: Date,
        public description: string,
    ) {}
}
