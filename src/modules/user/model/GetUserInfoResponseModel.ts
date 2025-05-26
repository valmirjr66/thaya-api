export default class GetUserInfoResponseModel {
    constructor(
        public fullname: string,
        public email: string,
        public birthdate: string,
        public nickname?: string,
    ) {}
}
