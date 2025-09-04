import { TELEGRAM_CHAT_TYPES } from 'src/constants';

export type ChatType = (typeof TELEGRAM_CHAT_TYPES)[number];
