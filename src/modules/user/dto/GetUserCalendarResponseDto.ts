import { Occurrence } from 'src/types/calendar';
import GenericCollectionResponse from 'src/types/generic';

export default class GetUserCalendarResponseDto extends GenericCollectionResponse<Occurrence> {
    constructor(public items: Occurrence[]) {
        super(items);
    }
}
