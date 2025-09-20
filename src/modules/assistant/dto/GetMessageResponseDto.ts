import { ApiProperty } from '@nestjs/swagger';
import { MESSAGE_ROLES } from 'src/constants';
import { MessageRole } from 'src/types/gpt';
import GetFileMetadataResponseDto from './GetFileMetadataResponseDto';

export default class GetMessageResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    content: string;

    @ApiProperty({ enum: MESSAGE_ROLES })
    role: MessageRole;

    @ApiProperty()
    chatId: string;

    @ApiProperty({ type: [GetFileMetadataResponseDto] })
    references: GetFileMetadataResponseDto[];
}
