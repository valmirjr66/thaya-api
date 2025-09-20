import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetLinkedPatientResponseDto from './GetLinkedPatientResponseDto';

export default class ListLinkedPatientsResponseDto
    implements ListResponse<GetLinkedPatientResponseDto>
{
    @ApiProperty({ type: [GetLinkedPatientResponseDto] })
    items: GetLinkedPatientResponseDto[];
}
