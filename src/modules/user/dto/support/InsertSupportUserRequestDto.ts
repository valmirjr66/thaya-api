import { ApiProperty } from '@nestjs/swagger';

export default class InsertSupportUserRequestDto {
    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public email: string;

    @ApiProperty()
    public password: string;

    constructor(fullname: string, email: string, password: string) {
        this.fullname = fullname;
        this.email = email;
        this.password = password;
    }
}
