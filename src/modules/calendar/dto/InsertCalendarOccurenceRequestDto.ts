import { ApiProperty } from '@nestjs/swagger';

export default class InsertCalendarOccurenceRequestDto {
    @ApiProperty({ required: true })
    public userId: string;

    @ApiProperty({ required: true })
    public patientId: string;

    @ApiProperty({ required: true })
    public datetime: Date;

    @ApiProperty({ required: true })
    public description: string;
}
