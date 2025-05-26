import { Message } from '../schemas/MessageSchema';

export default class GetChatByUserEmailResponseDto {
    constructor(
        public userEmail: string,
        public messages: Message[],
    ) {}
}
