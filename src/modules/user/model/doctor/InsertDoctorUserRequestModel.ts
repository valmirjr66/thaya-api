export default class InsertDoctorUserRequestModel {
    constructor(
        public fullname: string,
        public email: string,
        public phoneNumber: string,
        public password: string,
        public birthdate: string,
    ) {}
}
