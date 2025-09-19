export default class GetFileMetadataResponseModel {
    constructor(
        public downloadURL: string,
        public displayName?: string,
        public previewImageURL?: string,
    ) {}
}
