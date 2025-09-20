import { ApiProperty } from '@nestjs/swagger';

export default class GetLinkedPatientResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    fullname: string;

    @ApiProperty()
    nickname?: string;
}
