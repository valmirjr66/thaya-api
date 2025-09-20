export default class GetSupportUserInfoResponseModel {
    constructor(
        public id: string,
        public organizationId: string,
        public fullname: string,
        public email: string,
        public profilePicFileName?: string,
    ) {}
}
