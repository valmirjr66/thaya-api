import { ListResponse } from 'src/types/generic';
import GetPatientInfoResponseModel from './GetPatientUserInfoResponseModel';

export default class ListPatientUsersInfoResponseModel
    implements ListResponse<GetPatientInfoResponseModel>
{
    constructor(public items: GetPatientInfoResponseModel[]) {}
}
