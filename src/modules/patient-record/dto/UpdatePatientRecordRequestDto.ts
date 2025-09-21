import { ApiProperty } from '@nestjs/swagger';

export default class UpdatePatientRecordRequestDto {
    @ApiProperty({ required: true })
    summary: string;

    @ApiProperty({ required: true })
    content: string;
}
