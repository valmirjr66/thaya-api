import { ApiProperty } from '@nestjs/swagger';
import { SeriesType } from 'src/types/patient-record';

export default class UpdatePatientRecordRequestDto {
    @ApiProperty({ required: true })
    sumary: string;

    @ApiProperty({ required: true })
    content: string;

    @ApiProperty({ required: true })
    series: {
        title: string;
        type: SeriesType;
        records: { datetime: Date; value: number }[];
    }[];
}
