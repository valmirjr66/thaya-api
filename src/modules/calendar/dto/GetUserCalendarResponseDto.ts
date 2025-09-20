import { ApiProperty } from '@nestjs/swagger';
import { GetCalendarOccurrenceResponseDto } from './GetCalendarOccurrenceResponseDto';
import { ListResponse } from 'src/types/generic';

export default class GetUserCalendarResponseDto
    implements ListResponse<GetCalendarOccurrenceResponseDto>
{
    @ApiProperty({ type: [GetCalendarOccurrenceResponseDto] })
    items: GetCalendarOccurrenceResponseDto[];
}
