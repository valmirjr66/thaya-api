export default class InsertOrganizationRequestModel {
    constructor(
        public name: string,
        public collaborators: string[],
        public phoneNumber: string,
        public address: string,
        public timezoneOffset: number,
    ) {}
}
