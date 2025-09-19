import { AssistantTool } from 'openai/resources/beta/assistants.mjs';

export const UI_ASSISTANT_TOOLS: AssistantTool[] = [
    {
        type: 'function',
        function: {
            name: 'get_user_info',
            description:
                "Retrieves doctor's information including fullname, email, phone number and birthdate",
            strict: false,
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_current_datetime',
            description: "Returns user's current date and time",
            strict: false,
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'list_doctor_patients',
            description:
                "Retrieves doctor's patients basic information (id, fullname and optional nickname)",
            strict: false,
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_user_agenda',
            description:
                "Returns occurrences within a specified date range from the doctor's schedule; make sure to retrieve the current datetime for a precise response",
            strict: true,
            parameters: {
                type: 'object',
                required: ['from', 'to'],
                properties: {
                    from: {
                        type: 'object',
                        required: ['month', 'year'],
                        description: 'Start date for the schedule retrieval',
                        properties: {
                            month: {
                                type: 'string',
                                description:
                                    'Start month for the schedule retrieval (jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)',
                            },
                            year: {
                                type: 'number',
                                description:
                                    'Start year for the schedule retrieval',
                            },
                        },
                        additionalProperties: false,
                    },
                    to: {
                        type: 'object',
                        required: ['month', 'year'],
                        description: 'End date for the schedule retrieval',
                        properties: {
                            month: {
                                type: 'string',
                                description:
                                    'End month for the schedule retrieval (jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)',
                            },
                            year: {
                                type: 'number',
                                description:
                                    'End year for the schedule retrieval',
                            },
                        },
                        additionalProperties: false,
                    },
                },
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'insert_calendar_occurrence',
            description:
                "Creates an occurrence in doctor's schedule with the provided details",
            strict: true,
            parameters: {
                type: 'object',
                required: ['description', 'datetime'],
                properties: {
                    description: {
                        type: 'string',
                        description: 'Title or description of the occurrence',
                    },
                    datetime: {
                        type: 'string',
                        description:
                            'Date and time of the occurrence in ISO 8601 format (e.g., 2023-10-05T14:30:00Z)',
                    },
                },
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'delete_calendar_occurrence',
            description:
                "Deletes an occurrence from doctor's schedule with a given id",
            strict: true,
            parameters: {
                type: 'object',
                required: ['occurrenceId'],
                properties: {
                    occurrenceId: {
                        type: 'string',
                        description: 'The id of the occurrence to be deleted',
                    },
                },
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_calendar_occurrence',
            description:
                "Updates doctor's schedule occurrence with the provided details and a given id",
            strict: true,
            parameters: {
                type: 'object',
                required: ['occurrenceId', 'newDescription', 'newDatetime'],
                properties: {
                    occurrenceId: {
                        type: 'string',
                        description: 'The id of the occurrence to be updated',
                    },
                    newDescription: {
                        type: 'string',
                        description:
                            'The new title or description of the occurrence',
                    },
                    newDatetime: {
                        type: 'string',
                        description:
                            'The new date and time of the occurrence in ISO 8601 format (e.g., 2023-10-05T14:30:00Z)',
                    },
                },
                additionalProperties: false,
            },
        },
    },
];

export const TELEGRAM_ASSISTANT_TOOLS: AssistantTool[] = [
    {
        type: 'function',
        function: {
            name: 'get_user_info',
            description:
                "Retrieves patient's information including fullname, nickname (optional), email, phone number and birthdate",
            strict: false,
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_current_datetime',
            description: "Returns user's current date and time",
            strict: false,
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_user_agenda',
            description:
                "Returns patient's appointments within a specified date range; make sure to retrieve the current datetime for a precise response",
            strict: true,
            parameters: {
                type: 'object',
                required: ['from', 'to'],
                properties: {
                    from: {
                        type: 'object',
                        required: ['month', 'year'],
                        description:
                            'Start date for the appointments retrieval',
                        properties: {
                            month: {
                                type: 'string',
                                description:
                                    'Start month for the appointments retrieval (jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)',
                            },
                            year: {
                                type: 'number',
                                description:
                                    'Start year for the appointments retrieval',
                            },
                        },
                        additionalProperties: false,
                    },
                    to: {
                        type: 'object',
                        required: ['month', 'year'],
                        description: 'End date for the appointments retrieval',
                        properties: {
                            month: {
                                type: 'string',
                                description:
                                    'End month for the appointments retrieval (jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)',
                            },
                            year: {
                                type: 'number',
                                description:
                                    'End year for the appointments retrieval',
                            },
                        },
                        additionalProperties: false,
                    },
                },
                additionalProperties: false,
            },
        },
    },
];
