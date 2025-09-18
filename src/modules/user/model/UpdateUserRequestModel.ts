import { UserRole } from 'src/types/user';

export default class UpdateUserRequestModel {
    constructor(
        public id: string,
        public fullname: string,
        public role: UserRole,
        public email: string,
        public phoneNumber?: string,
        public birthdate?: string,
        public nickname?: string,
    ) {}
}
