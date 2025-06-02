export default class GetUserInfoResponseDto {
    constructor(
        public fullname: string,
        public email: string,
        public birthdate: string,
        public profilePicFileName?: string,
        public nickname?: string,
    ) {}
}
