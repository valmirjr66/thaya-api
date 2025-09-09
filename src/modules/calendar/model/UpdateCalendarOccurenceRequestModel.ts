export default class UpdateCalendarOccurenceRequestModel {
    constructor(
        public id: string,
        public userEmail: string,
        public datetime: Date,
        public description: string,
    ) {}
}
