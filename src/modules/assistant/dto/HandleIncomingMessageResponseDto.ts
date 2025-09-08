import { Role } from 'src/types/gpt';
import { FileMetadata } from '../schemas/FileMetadataSchema';
import { ApiProperty } from '@nestjs/swagger';

export default class HandleIncomingMessageResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public content: string;

    @ApiProperty()
    public role: Role;

    @ApiProperty()
    public references: FileMetadata[];

    constructor(
        id: string,
        content: string,
        role: Role,
        references: FileMetadata[] = [],
    ) {
        this.id = id;
        this.content = content;
        this.role = role;
        this.references = references;
    }
}
