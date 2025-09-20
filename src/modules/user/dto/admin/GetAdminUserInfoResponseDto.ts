import { ApiProperty } from '@nestjs/swagger';

export default class GetAdminUserInfoResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public email: string;
}
