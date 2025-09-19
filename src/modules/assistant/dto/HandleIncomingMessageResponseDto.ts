import { ApiProperty } from '@nestjs/swagger';
import { MESSAGE_ROLES } from 'src/constants';
import { Role } from 'src/types/gpt';
import GetFileMetadataResponseDto from './GetFileMetadataResponseDto';

export default class HandleIncomingMessageResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public content: string;

    @ApiProperty({ enum: MESSAGE_ROLES })
    public role: Role;

    @ApiProperty({ type: [GetFileMetadataResponseDto] })
    public references: GetFileMetadataResponseDto[];

    constructor(
        id: string,
        content: string,
        role: Role,
        references: GetFileMetadataResponseDto[] = [],
    ) {
        this.id = id;
        this.content = content;
        this.role = role;
        this.references = references;
    }
}
