import { ChatType } from 'src/types/telegram';

export default class IncomingMessageModel {
    constructor(
        public updateId: number,
        public messageId: number,
        public fromId: number,
        public isBot: boolean,
        public chatId: number,
        public chatType: ChatType,
        public date: number,
        public text?: string,
    ) {}
}
