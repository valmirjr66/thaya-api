export const MESSAGE_ROLES = ['system', 'user', 'assistant', 'tool'] as const;

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
    UNAUTHORIZED: 'Unauthorized',
};

export const TELEGRAM_CHAT_TYPES = [
    'private',
    'group',
    'supergroup',
    'channel',
] as const;

export const USER_ROLES = ['admin', 'doctor', 'support', 'patient'] as const;

export const COLLABORATOR_ROLES = ['doctor', 'support'] as const;
