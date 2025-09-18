import { ApiProperty } from '@nestjs/swagger';

export default class UpdateSupportUserRequestDto {
    @ApiProperty()
    public email: string;

    @ApiProperty()
    public fullname: string;

    constructor(email: string, fullname: string) {
        this.email = email;
        this.fullname = fullname;
    }
}
