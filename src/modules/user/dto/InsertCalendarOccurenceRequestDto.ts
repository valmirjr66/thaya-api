import { ApiProperty } from '@nestjs/swagger';

export default class InsertCalendarOccurenceRequestDto {
    @ApiProperty()
    public datetime: Date;

    @ApiProperty()
    public description: string;

    constructor(datetime: Date, description: string) {
        this.datetime = datetime;
        this.description = description;
    }
}
