import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetSupportUserInfoResponseDto from './GetSupportUserInfoResponseDto';

export default class ListSupportUsersInfoResponseDto
    implements ListResponse<GetSupportUserInfoResponseDto>
{
    @ApiProperty({ type: [GetSupportUserInfoResponseDto] })
    items: GetSupportUserInfoResponseDto[];

    constructor(items: GetSupportUserInfoResponseDto[]) {
        this.items = items;
    }
}
