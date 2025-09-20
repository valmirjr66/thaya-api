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
}
