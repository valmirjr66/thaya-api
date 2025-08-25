import * as dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { AssistantTool } from 'openai/src/resources/beta/assistants.js';
import fs from 'fs';

dotenv.config();

const OPENAI_CLIENT = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_TOOLS: AssistantTool[] = [
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
            name: 'get_weather_info',
            description:
                'Fetches the current weather based on the provided latitude and longitude of the location',
            strict: true,
            parameters: {
                type: 'object',
                required: ['latitude', 'longitude'],
                properties: {
                    latitude: {
                        type: 'number',
                        description: 'Geographical latitude of the location',
                    },
                    longitude: {
                        type: 'number',
                        description: 'Geographical longitude of the location',
                    },
                },
                additionalProperties: false,
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
                                type: 'number',
                                description:
                                    'Start month for retrieving agenda (January is month number 1)',
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
                                type: 'number',
                                description:
                                    'End month for retrieving agenda (January is month number 1)',
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
];

const ASSISTANT_NAME = 'Thaya';

const ASSISTANT_INSTRUCTIONS = `
You are ${ASSISTANT_NAME}, a personal day-to-day assistant, created to help me manage my agenda and answer me with helpful information.
Always be conscise and clear, but also sympathetic. All your replies must use Markdown for formatting.
Use headers, bullet points, code blocks, and inline formatting where appropriate.
Be structured, quickly readable and visually intuititive.
`.trim();

function updateEnvFile(key: string, value: string, envFilePath = '.env') {
    try {
        const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
        const lines = envFileContent.split('\n');

        let keyUpdated = false;

        const updatedLines = lines.map((line) => {
            if (line.startsWith(`${key}=`)) {
                keyUpdated = true;
                return `${key}="${value}"`;
            }
            return line;
        });

        if (!keyUpdated) {
            updatedLines.push(`${key}=${value}`);
        }

        fs.writeFileSync(envFilePath, updatedLines.join('\n'));

        console.log(`Updated ${key} in ${envFilePath} to ${value}`);
    } catch (error) {
        console.error('Error updating .env file:', error);
    }
}

async function resetAssistant() {
    const assistantsList = await OPENAI_CLIENT.beta.assistants.list();

    const existingAssistant = assistantsList.data.find(
        (assistant) => assistant.name === ASSISTANT_NAME,
    );

    if (existingAssistant) {
        console.log('Assistant already exists. Deleting it...');
        await OPENAI_CLIENT.beta.assistants.del(existingAssistant.id);
    }

    console.log('Creating new assistant...');

    const createdAssistant = await OPENAI_CLIENT.beta.assistants.create({
        model: 'gpt-4o',
        instructions: ASSISTANT_INSTRUCTIONS,
        name: ASSISTANT_NAME,
        tools: ASSISTANT_TOOLS,
    });

    console.log(
        `New assistant created with following id: "${createdAssistant.id}"`,
    );

    console.log('Updating .env file with assistant ID...');

    updateEnvFile('ASSISTANT_ID', createdAssistant.id);

    console.log('.env file updated');
}

resetAssistant();
