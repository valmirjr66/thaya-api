import { UserChatOrigin } from 'src/types/gpt';

export default class SendMessageRequestModel {
    constructor(
        public userEmail: string,
        public userChatOrigin: UserChatOrigin,
        public content: string,
    ) {}
}
