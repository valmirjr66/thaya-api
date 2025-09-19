import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/types/gpt';
import GetFileMetadataResponseDto from './GetFileMetadataResponseDto';
import { USER_ROLES } from 'src/constants';

export default class GetMessageResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    content: string;

    @ApiProperty({ enum: USER_ROLES })
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
