import { ApiProperty } from '@nestjs/swagger';
import { ListResponse } from 'src/types/generic';
import GetOrganizationByIdResponseDto from './GetOrganizationByIdResponseDto';

export default class ListOrganizationsResponseDto
    implements ListResponse<GetOrganizationByIdResponseDto>
{
    @ApiProperty({ type: [GetOrganizationByIdResponseDto] })
    items: GetOrganizationByIdResponseDto[];

    constructor(items: GetOrganizationByIdResponseDto[]) {
        this.items = items;
    }
}
