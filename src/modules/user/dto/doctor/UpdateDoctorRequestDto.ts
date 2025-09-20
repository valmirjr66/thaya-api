import { ApiProperty } from '@nestjs/swagger';

export default class UpdateDoctorRequestDto {
    @ApiProperty({ required: true })
    public email: string;

    @ApiProperty({ required: true })
    public fullname: string;

    @ApiProperty({ required: true })
    public birthdate: string;

    @ApiProperty({ required: true })
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
