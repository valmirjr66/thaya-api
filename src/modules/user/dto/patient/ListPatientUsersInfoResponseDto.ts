import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetPatientUserInfoResponseDto from './GetPatientUserInfoResponseDto';

export default class ListPatientUsersInfoResponseDto
    implements ListResponse<GetPatientUserInfoResponseDto>
{
    @ApiProperty({ type: [GetPatientUserInfoResponseDto] })
    items: GetPatientUserInfoResponseDto[];
}
