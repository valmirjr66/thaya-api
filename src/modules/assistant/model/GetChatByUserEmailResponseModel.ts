import { Message } from '../schemas/MessageSchema';

export default class GetChatByUserEmailResponseModel {
    constructor(
        public userEmail: string,
        public messages: Message[],
    ) {}
}
