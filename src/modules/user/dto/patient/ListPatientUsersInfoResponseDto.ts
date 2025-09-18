import GenericCollectionResponse from 'src/types/generic';
import GetPatientUserInfoResponseDto from './GetPatientUserInfoResponseDto';

export default class ListPatientUsersInfoResponseDto extends GenericCollectionResponse<GetPatientUserInfoResponseDto> {
    constructor(public items: GetPatientUserInfoResponseDto[]) {
        super(items);
    }
}
