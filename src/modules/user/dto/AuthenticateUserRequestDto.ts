export default class AuthenticateUserRequestDto {
    constructor(
        public email: string,
        public password: string,
    ) {}
}
