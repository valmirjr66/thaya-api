import { ApiProperty } from '@nestjs/swagger';

export default class UpdateCalendarOccurenceRequestDto {
    @ApiProperty({ required: true })
    public datetime: Date;

    @ApiProperty({ required: true })
    public description: string;
}
