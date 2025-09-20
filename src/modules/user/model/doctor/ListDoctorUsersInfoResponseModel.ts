import { ListResponse } from 'src/types/generic';
import GetDoctorUserInfoResponseModel from './GetDoctorUserInfoResponseModel';

export default class ListDoctorUsersInfoResponseModel
    implements ListResponse<GetDoctorUserInfoResponseModel>
{
    constructor(public items: GetDoctorUserInfoResponseModel[]) {}
}
