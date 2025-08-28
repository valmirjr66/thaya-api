export const MESSAGE_ROLES = ['system', 'user', 'assistant', 'tool'] as const;

export const USER_CHAT_ORIGINS = ['ui', 'whatsapp'] as const;

export const MONTHS_ABBREVIATION = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
] as const;

export const RESPONSE_DESCRIPTIONS = {
    NO_CONTENT: 'No content',
    NOT_FOUND: 'Not found',
    BAD_REQUEST: 'Bad request',
    CREATED: 'Created',
    OK: 'Ok',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    CONFLICT: 'Conflict',
};
