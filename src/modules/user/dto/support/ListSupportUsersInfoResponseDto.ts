import GenericCollectionResponse from 'src/types/generic';
import GetSupportUserInfoResponseDto from './GetSupportUserInfoResponseDto';

export default class ListSupportUsersInfoResponseDto extends GenericCollectionResponse<GetSupportUserInfoResponseDto> {
    constructor(public items: GetSupportUserInfoResponseDto[]) {
        super(items);
    }
}
