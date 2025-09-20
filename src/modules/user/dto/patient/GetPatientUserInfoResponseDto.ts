import { ApiProperty } from '@nestjs/swagger';

export default class GetPatientUserInfoResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public doctorsId: string[];

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
}
