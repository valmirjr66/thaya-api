import { ApiProperty } from '@nestjs/swagger';

export default class GetLinkedPatientResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    fullname: string;

    @ApiProperty()
    nickname?: string;

    constructor(id: string, fullname: string, nickname?: string) {
        this.id = id;
        this.fullname = fullname;
        this.nickname = nickname;
    }
}
