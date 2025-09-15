export default class GetOrganizationByIdResponseModel {
    constructor(
        public id: string,
        public collaborators: string[],
        public name: string,
        public address: string,
        public phoneNumber: string,
        public timezoneOffset: number,
    ) {}
}
