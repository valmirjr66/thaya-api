import { ApiProperty } from '@nestjs/swagger';

export default class UpdateUserRequestDto {
    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public birthdate: string;

    @ApiProperty()
    public phoneNumber: string;

    @ApiProperty()
    public nickname?: string;

    constructor(
        fullname: string,
        birthdate: string,
        phoneNumber: string,
        nickname?: string,
    ) {
        this.fullname = fullname;
        this.birthdate = birthdate;
        this.phoneNumber = phoneNumber;
        this.nickname = nickname;
    }
}
