import { ApiProperty } from '@nestjs/swagger';
import { SeriesDto } from './GetPatientRecordResponseDto';

export default class UpdatePatientRecordRequestDto {
    @ApiProperty({ required: true })
    sumary: string;

    @ApiProperty({ required: true })
    content: string;

    @ApiProperty({ required: true })
    series: SeriesDto[];
}
