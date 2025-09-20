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
}
