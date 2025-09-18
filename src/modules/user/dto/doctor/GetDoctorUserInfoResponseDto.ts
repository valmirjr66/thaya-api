import { ApiProperty } from '@nestjs/swagger';

export default class GetDoctorUserInfoResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public email: string;

    @ApiProperty()
    public phoneNumber: string;

    @ApiProperty()
    public birthdate: string;

    @ApiProperty()
    public profilePicFileName?: string;

    constructor(
        id: string,
        fullname: string,
        email: string,
        phoneNumber: string,
        birthdate: string,
        profilePicFileName?: string,
    ) {
        this.id = id;
        this.fullname = fullname;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.birthdate = birthdate;
        this.profilePicFileName = profilePicFileName;
    }
}
