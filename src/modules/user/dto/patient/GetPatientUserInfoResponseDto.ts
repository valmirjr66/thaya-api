import { ApiProperty } from '@nestjs/swagger';

export default class GetPatientUserInfoResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public fullname: string;

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
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.birthdate = birthdate;
        this.profilePicFileName = profilePicFileName;
        this.nickname = nickname;
        this.telegramUserId = telegramUserId;
        this.telegramChatId = telegramChatId;
    }
}
