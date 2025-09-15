export default class UpdateOrganizationRequestModel {
    constructor(
        public id: string,
        public name: string,
        public collaborators: string[],
        public phoneNumber: string,
        public address: string,
        public timezoneOffset: number,
    ) {}
}
