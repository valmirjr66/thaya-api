import { ListResponse } from 'src/types/generic';
import GetSupportUserInfoResponseModel from './GetSupportUserInfoResponseModel';

export default class ListSupportUsersInfoResponseModel
    implements ListResponse<GetSupportUserInfoResponseModel>
{
    constructor(public items: GetSupportUserInfoResponseModel[]) {}
}
