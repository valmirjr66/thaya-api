import { ApiProperty } from '@nestjs/swagger';

export default class InsertSupportUserRequestDto {
    @ApiProperty({ required: true })
    public organizationId: string;

    @ApiProperty({ required: true })
    public fullname: string;

    @ApiProperty({ required: true })
    public email: string;

    @ApiProperty({ required: true })
    public password: string;

    constructor(
        organizationId: string,
        fullname: string,
        email: string,
        password: string,
    ) {
        this.organizationId = organizationId;
        this.fullname = fullname;
        this.email = email;
        this.password = password;
    }
}
