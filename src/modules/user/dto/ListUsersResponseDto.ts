import GenericCollectionResponse from 'src/types/generic';
import GetUserInfoResponseDto from './GetUserInfoResponseDto';

export default class ListUsersResponseDto extends GenericCollectionResponse<GetUserInfoResponseDto> {
    constructor(public items: GetUserInfoResponseDto[]) {
        super(items);
    }
}
