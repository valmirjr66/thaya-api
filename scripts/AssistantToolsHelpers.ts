import { AssistantTool } from 'openai/resources/beta/assistants.mjs';

export const ASSISTANT_TOOLS: AssistantTool[] = [
    {
        type: 'function',
        function: {
            name: 'get_user_info',
            description:
                'Retrieves user information including fullname, nickname (optional), email, birthdate and its current location',
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
                'Retrieves agenda days containing events within a specified date range; make sure to retrieve the current datetime for a precise response',
            strict: true,
            parameters: {
                type: 'object',
                required: ['from', 'to'],
                properties: {
                    from: {
                        type: 'object',
                        required: ['month', 'year'],
                        description: 'Start date for retrieving agenda',
                        properties: {
                            month: {
                                type: 'string',
                                description:
                                    'Start month for retrieving agenda (jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)',
                            },
                            year: {
                                type: 'number',
                                description: 'Start year for retrieving agenda',
                            },
                        },
                        additionalProperties: false,
                    },
                    to: {
                        type: 'object',
                        required: ['month', 'year'],
                        description: 'End date for retrieving agenda',
                        properties: {
                            month: {
                                type: 'string',
                                description:
                                    'End month for retrieving agenda (jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec)',
                            },
                            year: {
                                type: 'number',
                                description: 'End year for retrieving agenda',
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
                'Creates a calendar event or reminder with the provided details',
            strict: true,
            parameters: {
                type: 'object',
                required: ['description', 'datetime'],
                properties: {
                    description: {
                        type: 'string',
                        description:
                            'Title or description of the event or reminder',
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
            description: 'Deletes a calendar event or reminder with a given id',
            strict: true,
            parameters: {
                type: 'object',
                required: ['occurrenceId'],
                properties: {
                    occurrenceId: {
                        type: 'string',
                        description:
                            'The id of the event or reminder to be deleted',
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
                'Updates a calendar event or reminder with the provided details and a given id',
            strict: true,
            parameters: {
                type: 'object',
                required: ['occurrenceId', 'newDescription', 'newDatetime'],
                properties: {
                    occurrenceId: {
                        type: 'string',
                        description:
                            'The id of the event or reminder to be updated',
                    },
                    newDescription: {
                        type: 'string',
                        description:
                            'The new title or description of the event or reminder',
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
