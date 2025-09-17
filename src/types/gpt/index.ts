import { MESSAGE_ROLES, USER_CHAT_ORIGINS } from 'src/constants';

export type Role = (typeof MESSAGE_ROLES)[number];

export type Annotation = {
    start_index: number;
    end_index: number;
    file_citation: { file_id: string };
    text: string;
    downloadURL?: string;
    displayName?: string;
};

export type UserChatOrigin = (typeof USER_CHAT_ORIGINS)[number];
