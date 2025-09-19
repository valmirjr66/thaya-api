import { Role } from 'src/types/gpt';
import GetFileMetadataResponseModel from './GetFileMetadataResponseModel';

export default class GetMessageResponseModel {
    constructor(
        public id: string,
        public content: string,
        public role: Role,
        public chatId: string,
        public references: GetFileMetadataResponseModel[],
    ) {}
}
