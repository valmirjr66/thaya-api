import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetPatientRecordResponseDto from './GetPatientRecordResponseDto';

export default class ListPatientRecordsResponseDto
    implements ListResponse<GetPatientRecordResponseDto>
{
    @ApiProperty({ type: [GetPatientRecordResponseDto] })
    items: GetPatientRecordResponseDto[];
}
