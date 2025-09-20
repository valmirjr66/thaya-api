import { ListResponse } from 'src/types/generic';

type LinkedDoctor = {
    id: string;
    fullname: string;
    email: string;
};

export default class ListLinkedDoctorsResponseModel
    implements ListResponse<LinkedDoctor>
{
    constructor(public items: LinkedDoctor[]) {}
}
