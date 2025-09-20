import { ListResponse } from 'src/types/generic';
import { GetCalendarOccurrenceResponseModel } from './GetCalendarOccurrenceResponseModel';

export default class GetUserCalendarResponseModel
    implements ListResponse<GetCalendarOccurrenceResponseModel>
{
    constructor(public items: GetCalendarOccurrenceResponseModel[]) {}
}
