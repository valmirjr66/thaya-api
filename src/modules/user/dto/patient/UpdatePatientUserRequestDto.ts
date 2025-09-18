import { ApiProperty } from '@nestjs/swagger';

export default class UpdatePatientUserRequestDto {
    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public email: string;

    @ApiProperty()
    public phoneNumber: string;

    @ApiProperty()
    public birthdate: string;

    @ApiProperty()
    public profilePicFileName: string;

    @ApiProperty()
    public nickname: string;

    @ApiProperty()
    public password: string;

    constructor(
        fullname: string,
        email: string,
        phoneNumber: string,
        birthdate: string,
        profilePicFileName: string,
        nickname: string,
        password: string,
    ) {
        this.fullname = fullname;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.birthdate = birthdate;
        this.profilePicFileName = profilePicFileName;
        this.nickname = nickname;
        this.password = password;
    }
}
