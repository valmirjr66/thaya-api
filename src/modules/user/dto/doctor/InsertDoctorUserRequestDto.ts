import { ApiProperty } from '@nestjs/swagger';

export default class InsertDoctorUserRequestDto {
    @ApiProperty({ required: true })
    public organizationId: string;

    @ApiProperty({ required: true })
    public fullname: string;

    @ApiProperty({ required: true })
    public email: string;

    @ApiProperty({ required: true })
    public phoneNumber: string;

    @ApiProperty({ required: true })
    public password: string;

    @ApiProperty({ required: true })
    public birthdate: string;

    constructor(
        organizationId: string,
        fullname: string,
        email: string,
        phoneNumber: string,
        password: string,
        birthdate: string,
    ) {
        this.organizationId = organizationId;
        this.fullname = fullname;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.birthdate = birthdate;
    }
}
