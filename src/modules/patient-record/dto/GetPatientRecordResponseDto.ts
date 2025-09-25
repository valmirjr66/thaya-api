import { ApiProperty } from '@nestjs/swagger';
import { SERIES_TYPES } from 'src/constants';
import { SeriesType } from 'src/types/patient-record';

export class SeriesDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty({ enum: SERIES_TYPES })
    type: SeriesType;

    @ApiProperty({ type: [Object] })
    records: { id: string; datetime: Date; value: number }[];
}

export class UnidentifiedSeriesDto {
    @ApiProperty()
    title: string;

    @ApiProperty({ enum: SERIES_TYPES })
    type: SeriesType;

    @ApiProperty({ type: [Object] })
    records: { datetime: Date; value: number }[];
}

export default class GetPatientRecordResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    doctorId: string;

    @ApiProperty()
    patientId: string;

    @ApiProperty()
    summary: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    series: SeriesDto[];
}
