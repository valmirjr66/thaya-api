import { ApiProperty } from '@nestjs/swagger';

export default class InsertUserRequestDto {
    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public email: string;

    @ApiProperty()
    public phoneNumber: string;

    @ApiProperty()
    public password: string;

    @ApiProperty()
    public birthdate: string;

    @ApiProperty()
    public nickname?: string;

    constructor(
        fullname: string,
        email: string,
        phoneNumber: string,
        password: string,
        birthdate: string,
        nickname?: string,
    ) {
        this.fullname = fullname;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.birthdate = birthdate;
        this.nickname = nickname;
    }
}
