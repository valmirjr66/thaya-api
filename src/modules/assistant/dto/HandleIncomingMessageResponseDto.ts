import { ApiProperty } from '@nestjs/swagger';
import { MESSAGE_ROLES } from 'src/constants';
import { MessageRole } from 'src/types/gpt';
import GetFileMetadataResponseDto from './GetFileMetadataResponseDto';

export default class HandleIncomingMessageResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public content: string;

    @ApiProperty({ enum: MESSAGE_ROLES })
    public role: MessageRole;

    @ApiProperty({ type: [GetFileMetadataResponseDto] })
    public references: GetFileMetadataResponseDto[];

    constructor(
        id: string,
        content: string,
        role: MessageRole,
        references: GetFileMetadataResponseDto[] = [],
    ) {
        this.id = id;
        this.content = content;
        this.role = role;
        this.references = references;
    }
}
