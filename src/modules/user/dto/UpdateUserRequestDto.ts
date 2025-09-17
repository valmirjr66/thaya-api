import { ApiProperty } from '@nestjs/swagger';
import { USER_ROLES } from 'src/constants';
import { UserRole } from 'src/types/user';

export default class UpdateUserRequestDto {
    @ApiProperty()
    public email: string;

    @ApiProperty()
    public fullname: string;

    @ApiProperty({ example: USER_ROLES[1] })
    public role: UserRole;

    @ApiProperty()
    public birthdate: string;

    @ApiProperty()
    public phoneNumber: string;

    @ApiProperty()
    public nickname?: string;

    constructor(
        fullname: string,
        role: UserRole,
        birthdate: string,
        phoneNumber: string,
        nickname?: string,
    ) {
        this.fullname = fullname;
        this.role = role;
        this.birthdate = birthdate;
        this.phoneNumber = phoneNumber;
        this.nickname = nickname;
    }
}
