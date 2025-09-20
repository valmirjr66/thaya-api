import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetLinkedDoctorResponseDto from './GetLinkedDoctorResponseDto';

export default class ListLinkedDoctorsResponseDto
    implements ListResponse<GetLinkedDoctorResponseDto>
{
    @ApiProperty({ type: [GetLinkedDoctorResponseDto] })
    items: GetLinkedDoctorResponseDto[];
}
