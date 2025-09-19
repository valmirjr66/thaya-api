export default class InsertPatientUserRequestModel {
    constructor(
        public doctorsId: string[],
        public fullname: string,
        public email: string,
        public phoneNumber: string,
        public birthdate: string,
        public nickname: string,
        public password: string,
    ) {}
}
