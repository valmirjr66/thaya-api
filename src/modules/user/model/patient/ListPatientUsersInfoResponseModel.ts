import GenericCollectionResponse from 'src/types/generic';
import GetPatientInfoResponseModel from './GetPatientInfoResponseModel';

export default class ListPatientUsersInfoResponseModel extends GenericCollectionResponse<GetPatientInfoResponseModel> {
    constructor(public items: GetPatientInfoResponseModel[]) {
        super(items);
    }
}
