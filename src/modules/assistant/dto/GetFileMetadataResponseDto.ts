import { ApiProperty } from '@nestjs/swagger';

export default class GetFileMetadataResponseDto {
    @ApiProperty()
    downloadURL: string;

    @ApiProperty()
    displayName?: string;

    @ApiProperty()
    previewImageURL?: string;
}
