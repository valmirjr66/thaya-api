import GenericCollectionResponse from 'src/types/generic';
import GetSupportUserInfoResponseModel from './GetSupportUserInfoResponseModel';

export default class ListSupportUsersInfoResponseModel extends GenericCollectionResponse<GetSupportUserInfoResponseModel> {
    constructor(public items: GetSupportUserInfoResponseModel[]) {
        super(items);
    }
}
