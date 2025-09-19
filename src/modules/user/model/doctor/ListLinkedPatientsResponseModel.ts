import GenericCollectionResponse from 'src/types/generic';

export default class ListLinkedPatientsResponseModel extends GenericCollectionResponse<{
    id: string;
    fullname: string;
    nickname?: string;
}> {
    constructor(
        public readonly patients: {
            id: string;
            fullname: string;
            nickname: string;
        }[],
    ) {
        super(patients);
    }
}
