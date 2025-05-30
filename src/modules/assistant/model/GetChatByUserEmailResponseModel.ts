import GenericCollectionResponse from 'src/types/generic';
import { Message } from '../schemas/MessageSchema';

export default class GetChatByUserEmailResponseModel extends GenericCollectionResponse<Message> {
    constructor(public items: Message[]) {
        super(items);
    }
}
