export default class UpdateUserRequestDto {
    constructor(
        public fullname: string,
        public birthdate: string,
        public nickname?: string,
    ) {}
}
