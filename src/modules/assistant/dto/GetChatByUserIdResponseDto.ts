import { Message } from '../schemas/MessageSchema';

export default class GetChatByUserIdResponseDto {
    constructor(
        public id: string,
        public messages: Message[],
    ) {}
}
