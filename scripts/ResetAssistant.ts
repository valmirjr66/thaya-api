import * as dotenv from 'dotenv';
import fs from 'fs';
import { OpenAI } from 'openai';
import { ASSISTANT_TOOLS } from './AssistantToolsHelpers';
import { updateSecret } from './SecretManagerHelper';

dotenv.config();

const OPENAI_CLIENT = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_NAME = 'Thaya';

const UI_ASSISTANT_INSTRUCTIONS = `
You are ${ASSISTANT_NAME}, a personal day-to-day assistant, created to help users manage agenda and answer me with helpful information made available by external services.
Always be conscise and clear, but also sympathetic. Your messages will be presented in a dynamic UI, so enrich your answers with emojis and Markdown for formatting when seem fit.
Be structured, quickly readable and visually intuititive.
`.trim();

const TELEGRAM_ASSISTANT_INSTRUCTIONS = `
You are ${ASSISTANT_NAME}, a personal day-to-day assistant, created to help users manage agenda and answer me with helpful information made available by external services.
Always be conscise and clear, but also sympathetic. Your messages will be presented in a Telegram chat, so enrich your answers with emojis, but never use Markdown for formatting.
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

async function createAssistant(name: string, instructions: string) {
    const createdAssistant = await OPENAI_CLIENT.beta.assistants.create({
        model: 'gpt-4o',
        instructions,
        name,
        tools: ASSISTANT_TOOLS,
    });

    console.log(
        `New assistant created with name "${name}" and id "${createdAssistant.id}"`,
    );

    return createdAssistant.id;
}

async function resetAssistants() {
    const assistantsList = await OPENAI_CLIENT.beta.assistants.list();

    const existingAssistant = assistantsList.data.filter(
        (assistant) =>
            assistant.name === `${ASSISTANT_NAME} (UI)` ||
            assistant.name === `${ASSISTANT_NAME} (Telegram)`,
    );

    if (existingAssistant.length) {
        console.log(
            'Assistant(s) with same name already exists, deleting it...',
        );
        existingAssistant.forEach(
            async (existingAssistant) =>
                await OPENAI_CLIENT.beta.assistants.del(existingAssistant.id),
        );
    }

    console.log('Creating new assistant...');

    const UIAssistantId = await createAssistant(
        `${ASSISTANT_NAME} (UI)`,
        UI_ASSISTANT_INSTRUCTIONS,
    );

    const telegramAssistantId = await createAssistant(
        `${ASSISTANT_NAME} (Telegram)`,
        TELEGRAM_ASSISTANT_INSTRUCTIONS,
    );

    console.log('Updating .env file with assistant IDs...');

    updateEnvFile('UI_ASSISTANT_ID', UIAssistantId);
    updateEnvFile('TELEGRAM_ASSISTANT_ID', telegramAssistantId);

    console.log('.env file updated');

    updateSecret(process.env.UI_ASSISTANT_ID_SECRET_NAME, UIAssistantId);
    updateSecret(
        process.env.TELEGRAM_ASSISTANT_ID_SECRET_NAME,
        telegramAssistantId,
    );
}

resetAssistants();
