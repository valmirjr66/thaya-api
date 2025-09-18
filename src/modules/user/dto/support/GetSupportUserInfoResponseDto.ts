import { ApiProperty } from '@nestjs/swagger';

export default class GetSupportUserInfoResponseDto {
    @ApiProperty({ required: true })
    public id: string;

    @ApiProperty({ required: true })
    public organizationId: string;

    @ApiProperty({ required: true })
    public fullname: string;

    @ApiProperty({ required: true })
    public email: string;

    constructor(
        id: string,
        organizationId: string,
        fullname: string,
        email: string,
    ) {
        this.id = id;
        this.organizationId = organizationId;
        this.fullname = fullname;
        this.email = email;
    }
}
