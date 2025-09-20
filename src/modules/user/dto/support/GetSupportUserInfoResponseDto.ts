import { ApiProperty } from '@nestjs/swagger';

export default class GetSupportUserInfoResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public organizationId: string;

    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public email: string;
}
