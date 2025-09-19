import { ApiProperty } from '@nestjs/swagger';

export default class GetFileMetadataResponseDto {
    @ApiProperty()
    downloadURL: string;

    @ApiProperty()
    displayName?: string;

    @ApiProperty()
    previewImageURL?: string;

    constructor(
        downloadURL: string,
        displayName?: string,
        previewImageURL?: string,
    ) {
        this.downloadURL = downloadURL;
        this.displayName = displayName;
        this.previewImageURL = previewImageURL;
    }
}
