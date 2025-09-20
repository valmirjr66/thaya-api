import { MessageRole } from 'src/types/gpt';
import { FileMetadata } from '../schemas/FileMetadataSchema';

export default class HandleIncomingMessageResponseModel {
    constructor(
        public id: string,
        public content: string,
        public role: MessageRole,
        public references: FileMetadata[] = [],
    ) {}
}
