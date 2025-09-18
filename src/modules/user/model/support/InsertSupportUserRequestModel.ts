export default class InsertSupportUserRequestModel {
    constructor(
        public organizationId: string,
        public fullname: string,
        public email: string,
        public password: string,
    ) {}
}
