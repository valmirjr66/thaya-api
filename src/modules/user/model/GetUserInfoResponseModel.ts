export default class GetUserInfoResponseModel {
    constructor(
        public fullname: string,
        public email: string,
        public phoneNumber: string,
        public birthdate: string,
        public profilePicFileName?: string,
        public nickname?: string,
        public telegramUserId?: number,
        public telegramChatId?: number,
    ) {}
}
