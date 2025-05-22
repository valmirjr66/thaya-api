import { Message } from '../schemas/MessageSchema';

export default class GetChatByUserIdResponseModel {
    constructor(
        public id: string,
        public messages: Message[],
    ) {}
}
