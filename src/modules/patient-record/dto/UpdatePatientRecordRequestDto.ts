import { ApiProperty } from '@nestjs/swagger';
import { SeriesDto } from './GetPatientRecordResponseDto';

export default class UpdatePatientRecordRequestDto {
    @ApiProperty({ required: true })
    summary: string;

    @ApiProperty({ required: true })
    content: string;

    @ApiProperty({ required: true })
    series: SeriesDto[];
}
