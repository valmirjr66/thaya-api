import { ApiProperty } from '@nestjs/swagger';

export default class InsertCalendarOccurenceRequestDto {
    @ApiProperty()
    public userId: string;

    @ApiProperty()
    public patientId: string;

    @ApiProperty()
    public datetime: Date;

    @ApiProperty()
    public description: string;
}
