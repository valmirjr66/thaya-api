export default class InsertUserRequestDto {
    constructor(
        public fullname: string,
        public email: string,
        public password: string,
        public birthdate: string,
        public nickname?: string,
    ) {}
}
