export default class UpdatePatientUserRequestModel {
    constructor(
        public doctorsId: string[], // array of ObjectId strings
        public id: string,
        public fullname: string,
        public email: string,
        public phoneNumber: string,
        public birthdate: string,
        public profilePicFileName: string,
        public nickname: string,
        public password: string,
    ) {}
}
