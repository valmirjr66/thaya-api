import { ApiProperty } from '@nestjs/swagger';

export default class GetAdminUserInfoResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public email: string;

    constructor(id: string, fullname: string, email: string) {
        this.id = id;
        this.fullname = fullname;
        this.email = email;
    }
}
