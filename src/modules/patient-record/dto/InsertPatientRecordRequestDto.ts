import { ApiProperty } from '@nestjs/swagger';
import { UnidentifiedSeriesDto } from './GetPatientRecordResponseDto';

export default class InsertPatientRecordRequestDto {
    @ApiProperty({ required: true })
    doctorId: string;

    @ApiProperty({ required: true })
    patientId: string;

    @ApiProperty({ required: true })
    summary: string;

    @ApiProperty({ required: true })
    content: string;

    @ApiProperty({ required: true })
    series: UnidentifiedSeriesDto[];
}
