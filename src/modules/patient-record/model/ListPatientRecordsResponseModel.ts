import { ListResponse } from 'src/types/generic';
import GetPatientRecordResponseModel from './GetPatientRecordResponseModel';

export default class ListPatientRecordsResponseModel
    implements ListResponse<GetPatientRecordResponseModel>
{
    constructor(public items: GetPatientRecordResponseModel[]) {}
}
