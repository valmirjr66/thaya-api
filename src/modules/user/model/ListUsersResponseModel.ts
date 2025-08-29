import GenericCollectionResponse from 'src/types/generic';
import GetUserInfoResponseModel from './GetUserInfoResponseModel';

export default class ListUsersResponseModel extends GenericCollectionResponse<GetUserInfoResponseModel> {
    constructor(public items: GetUserInfoResponseModel[]) {
        super(items);
    }
}
