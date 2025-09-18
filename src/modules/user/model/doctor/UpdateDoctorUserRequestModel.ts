export default class UpdateDoctorUserRequestModel {
    constructor(
        public id: string,
        public email: string,
        public fullname: string,
        public birthdate: string,
        public phoneNumber: string,
    ) {}
}
