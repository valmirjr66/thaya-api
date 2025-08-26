import { MESSAGE_ROLES, USER_CHAT_ORIGINS } from 'src/constants';
import { Chat } from 'src/modules/assistant/schemas/ChatSchema';

export type Role = (typeof MESSAGE_ROLES)[number];

export type Annotation = {
    start_index: number;
    end_index: number;
    file_citation: { file_id: string };
    text: string;
    downloadURL?: string;
    displayName?: string;
};

export type SimplifiedConversation = Omit<
    Chat,
    'messages' | 'references' | 'threadId' | 'userEmail'
>;

export type UserChatOrigin = (typeof USER_CHAT_ORIGINS)[number];
