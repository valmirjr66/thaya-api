export default class UpdateUserRequestDto {
    constructor(
        public fullname: string,
        public email: string,
        public password: string,
        public birthdate: string,
        public nickname?: string,
    ) {}
}
