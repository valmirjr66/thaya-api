export default class UpdatePatientUserRequestModel {
    constructor(
        public doctorsId: string[],
        public id: string,
        public fullname: string,
        public email: string,
        public phoneNumber: string,
        public birthdate: string,
        public nickname: string,
        public password: string,
    ) {}
}
