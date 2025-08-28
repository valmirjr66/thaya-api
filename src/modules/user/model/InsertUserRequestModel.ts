export default class InsertUserRequestModel {
    constructor(
        public fullname: string,
        public email: string,
        public phoneNumber: string,
        public password: string,
        public birthdate: string,
        public nickname?: string,
    ) {}
}
