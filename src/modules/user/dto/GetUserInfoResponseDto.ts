import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/types/user';

export default class GetUserInfoResponseDto {
    @ApiProperty()
    public fullname: string;

    @ApiProperty()
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
