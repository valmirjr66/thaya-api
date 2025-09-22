import { ListResponse } from 'src/types/generic';
import GetPrescriptionResponseModel from './GetPrescriptionResponseModel';

export default class ListPrescriptionsResponseModel
    implements ListResponse<GetPrescriptionResponseModel>
{
    constructor(public items: GetPrescriptionResponseModel[]) {}
}
