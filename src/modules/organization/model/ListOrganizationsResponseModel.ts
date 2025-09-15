import GenericCollectionResponse from 'src/types/generic';
import GetOrganizationByIdResponseModel from './GetOrganizationByIdResponseModel';

export default class ListOrganizationsResponseModel extends GenericCollectionResponse<GetOrganizationByIdResponseModel> {
    constructor(public items: GetOrganizationByIdResponseModel[]) {
        super(items);
    }
}
