export default class GetPatientUserInfoResponseModel {
    constructor(
        public id: string,
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
