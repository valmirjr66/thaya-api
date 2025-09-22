export default class ChangeProfilePictureRequestModel {
    constructor(
        public readonly organizationId: string,
        public readonly profilePicture: Express.Multer.File,
    ) {}
}
