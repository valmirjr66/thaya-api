import { ListResponse } from 'src/types/generic';
import GetOrganizationByIdResponseModel from './GetOrganizationByIdResponseModel';

export default class ListOrganizationsResponseModel
    implements ListResponse<GetOrganizationByIdResponseModel>
{
    constructor(public items: GetOrganizationByIdResponseModel[]) {}
}
