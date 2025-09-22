import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetPrescriptionResponseDto from './GetPrescriptionResponseDto';

export default class ListPrescriptionsResponseDto
    implements ListResponse<GetPrescriptionResponseDto>
{
    @ApiProperty({ type: [GetPrescriptionResponseDto] })
    items: GetPrescriptionResponseDto[];
}
