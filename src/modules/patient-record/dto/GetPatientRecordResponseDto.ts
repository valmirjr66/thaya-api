import { ApiProperty } from '@nestjs/swagger';
import { SeriesType } from 'src/types/patient-record';

export default class GetPatientRecordResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    doctorId: string;

    @ApiProperty()
    patientId: string;

    @ApiProperty()
    sumary: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    series: {
        title: string;
        type: SeriesType;
        records: { datetime: Date; value: number }[];
    }[];
}
