import GenericCollectionResponse from 'src/types/generic';
import GetDoctorUserInfoResponseDto from './GetDoctorUserInfoResponseDto';

export default class ListDoctorUsersInfoResponseDto extends GenericCollectionResponse<GetDoctorUserInfoResponseDto> {
    constructor(public items: GetDoctorUserInfoResponseDto[]) {
        super(items);
    }
}
