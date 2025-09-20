import { ListResponse } from 'src/types/generic';

type LinkedPatient = {
    id: string;
    fullname: string;
    nickname: string;
};

export default class ListLinkedPatientsResponseModel
    implements ListResponse<LinkedPatient>
{
    constructor(public items: LinkedPatient[]) {}
}
