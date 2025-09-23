export default class UpdateFileRequestModel {
    constructor(
        public readonly prescriptionId: string,
        public readonly file: Express.Multer.File,
    ) {}
}
