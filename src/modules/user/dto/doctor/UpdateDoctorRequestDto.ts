import { ApiProperty } from '@nestjs/swagger';

export default class UpdateDoctorRequestDto {
    @ApiProperty()
    public email: string;

    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public birthdate: string;

    @ApiProperty()
    public phoneNumber: string;

    constructor(
        email: string,
        fullname: string,
        birthdate: string,
        phoneNumber: string,
    ) {
        this.email = email;
        this.fullname = fullname;
        this.birthdate = birthdate;
        this.phoneNumber = phoneNumber;
    }
}
