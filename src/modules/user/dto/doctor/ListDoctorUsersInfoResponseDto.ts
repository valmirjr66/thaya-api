import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetDoctorUserInfoResponseDto from './GetDoctorUserInfoResponseDto';

export default class ListDoctorUsersInfoResponseDto
    implements ListResponse<GetDoctorUserInfoResponseDto>
{
    @ApiProperty({ type: [GetDoctorUserInfoResponseDto] })
    items: GetDoctorUserInfoResponseDto[];
}
