import { MESSAGE_ROLES } from 'src/constants';

export type MessageRole = (typeof MESSAGE_ROLES)[number];

export type Annotation = {
    start_index: number;
    end_index: number;
    file_citation: { file_id: string };
    text: string;
    downloadURL?: string;
    displayName?: string;
};
