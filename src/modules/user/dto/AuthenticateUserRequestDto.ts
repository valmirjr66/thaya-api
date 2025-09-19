import { ApiProperty } from '@nestjs/swagger';

export default class AuthenticateUserRequestDto {
    @ApiProperty({ required: true })
    public email: string;

    @ApiProperty({ required: true })
    public password: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }
}
