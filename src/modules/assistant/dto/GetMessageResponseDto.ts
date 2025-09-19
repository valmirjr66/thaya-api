import { ApiProperty } from '@nestjs/swagger';
import { MESSAGE_ROLES } from 'src/constants';
import { Role } from 'src/types/gpt';
import GetFileMetadataResponseDto from './GetFileMetadataResponseDto';

export default class GetMessageResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    content: string;

    @ApiProperty({ enum: MESSAGE_ROLES })
    role: Role;

    @ApiProperty()
    chatId: string;

    @ApiProperty({ type: [GetFileMetadataResponseDto] })
    references: GetFileMetadataResponseDto[];

    constructor(
        id: string,
        content: string,
        role: Role,
        chatId: string,
        references: GetFileMetadataResponseDto[],
    ) {
        this.id = id;
        this.content = content;
        this.role = role;
        this.chatId = chatId;
        this.references = references;
    }
}
