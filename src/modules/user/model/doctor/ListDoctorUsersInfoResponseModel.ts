import GenericCollectionResponse from 'src/types/generic';
import GetDoctorUserInfoResponseModel from './GetDoctorUserInfoResponseModel';

export default class ListDoctorUsersInfoResponseModel extends GenericCollectionResponse<GetDoctorUserInfoResponseModel> {
    constructor(public items: GetDoctorUserInfoResponseModel[]) {
        super(items);
    }
}
