import GenericCollectionResponse from 'src/types/generic';
import { Message } from '../schemas/MessageSchema';

export default class GetChatByUserIdResponseDto extends GenericCollectionResponse<Message> {
    constructor(items: Message[]) {
        super(items);
    }
}
