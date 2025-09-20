import { ApiProperty } from '@nestjs/swagger';

export class GetCalendarOccurrenceResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    patientId: string;

    @ApiProperty()
    datetime: Date;

    @ApiProperty()
    description: string;

    constructor(
        id: string,
        patientId: string,
        datetime: Date,
        description: string,
    ) {
        this.id = id;
        this.patientId = patientId;
        this.datetime = datetime;
        this.description = description;
    }
}
