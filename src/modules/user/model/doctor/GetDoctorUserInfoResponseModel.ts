export default class GetDoctorUserInfoResponseModel {
    constructor(
        public id: string,
        public organizationId: string,
        public fullname: string,
        public email: string,
        public phoneNumber: string,
        public birthdate: string,
        public profilePicFileName?: string,
    ) {}
}
