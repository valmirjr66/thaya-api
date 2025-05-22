import { Role } from 'src/types/gpt';
import { FileMetadata } from '../schemas/FileMetadataSchema';

export default class SendMessageResponseDto {
    constructor(
        public id: string,
        public content: string,
        public role: Role,
        public references: FileMetadata[] = [],
    ) {}
}
