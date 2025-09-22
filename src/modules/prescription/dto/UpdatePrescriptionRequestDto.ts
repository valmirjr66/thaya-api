import { ApiProperty } from '@nestjs/swagger';

export default class UpdatePrescriptionRequestDto {
    @ApiProperty()
    summary?: string;
}
