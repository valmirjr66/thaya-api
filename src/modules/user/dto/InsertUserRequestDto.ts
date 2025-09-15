import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/types/user';

export default class InsertUserRequestDto {
    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public role: UserRole;

    @ApiProperty()
    public email: string;

    @ApiProperty()
    public phoneNumber: string;

    @ApiProperty()
    public password: string;

    @ApiProperty()
    public birthdate: string;

    @ApiProperty()
    public nickname?: string;

    constructor(
        fullname: string,
        role: UserRole,
        email: string,
        phoneNumber: string,
        password: string,
        birthdate: string,
        nickname?: string,
    ) {
        this.fullname = fullname;
        this.role = role;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.birthdate = birthdate;
        this.nickname = nickname;
    }
}
