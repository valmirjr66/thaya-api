import { UserRole } from 'src/types/user';

export default class InsertUserRequestModel {
    constructor(
        public fullname: string,
        public role: UserRole,
        public email: string,
        public phoneNumber: string,
        public password: string,
        public birthdate: string,
        public nickname?: string,
    ) {}
}
