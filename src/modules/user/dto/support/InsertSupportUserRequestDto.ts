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
}
