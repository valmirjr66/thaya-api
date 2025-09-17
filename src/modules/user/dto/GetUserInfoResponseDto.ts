import { ApiProperty } from '@nestjs/swagger';
import { USER_ROLES } from 'src/constants';
import { UserRole } from 'src/types/user';

export default class GetUserInfoResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public fullname: string;

    @ApiProperty({ example: USER_ROLES[1] })
    public role: UserRole;

    @ApiProperty()
    public email: string;

    @ApiProperty()
    public phoneNumber: string;

    @ApiProperty()
    public birthdate: string;

    @ApiProperty()
    public profilePicFileName?: string;

    @ApiProperty()
    public nickname?: string;

    @ApiProperty()
    public telegramUserId?: number;

    @ApiProperty()
    public telegramChatId?: number;

    constructor(
        id: string,
        fullname: string,
        role: UserRole,
        email: string,
        phoneNumber: string,
        birthdate: string,
        profilePicFileName?: string,
        nickname?: string,
        telegramUserId?: number,
        telegramChatId?: number,
    ) {
        this.id = id;
        this.fullname = fullname;
        this.role = role;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.birthdate = birthdate;
        this.profilePicFileName = profilePicFileName;
        this.nickname = nickname;
        this.telegramUserId = telegramUserId;
        this.telegramChatId = telegramChatId;
    }
}
