import { ApiProperty } from '@nestjs/swagger';
import { PrescriptionStatus } from 'src/types/prescription';

export default class GetPrescriptionResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    doctorId: string;

    @ApiProperty()
    patientId: string;

    @ApiProperty()
    summary?: string;

    @ApiProperty()
    fileName?: string;

    @ApiProperty()
    status: PrescriptionStatus;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
