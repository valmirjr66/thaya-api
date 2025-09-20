import { ApiProperty } from '@nestjs/swagger';

export default class UpdateCalendarOccurenceRequestDto {
    @ApiProperty()
    public datetime: Date;

    @ApiProperty()
    public description: string;
}
