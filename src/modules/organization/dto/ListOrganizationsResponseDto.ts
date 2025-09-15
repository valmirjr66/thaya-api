import GenericCollectionResponse from 'src/types/generic';
import GetOrganizationByIdResponseDto from './GetOrganizationByIdResponseDto';

export default class ListOrganizationsResponseDto extends GenericCollectionResponse<GetOrganizationByIdResponseDto> {
    constructor(public items: GetOrganizationByIdResponseDto[]) {
        super(items);
    }
}
