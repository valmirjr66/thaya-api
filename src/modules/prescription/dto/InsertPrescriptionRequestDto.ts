import { ApiProperty } from '@nestjs/swagger';

export default class InsertPrescriptionRequestDto {
    @ApiProperty({ required: true })
    doctorId: string;

    @ApiProperty({ required: true })
    patientId: string;
}
