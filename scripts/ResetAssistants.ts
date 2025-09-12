import * as dotenv from 'dotenv';
import fs from 'fs';
import { OpenAI } from 'openai';
import { ASSISTANT_TOOLS } from './AssistantToolsHelpers';
import { createOrUpdateSecret } from './SecretManagerHelper';

dotenv.config();

const OPENAI_CLIENT = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_TO_BE_USED = 'gpt-4o';

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

const ROUTINE_ASSISTANT_INSTRUCTIONS = `
You are ${ASSISTANT_NAME}, an assistant created to compose messages containing the items in the user's agenda for the given days, thus helping the user to remember their commitments.
Always be concise and clear, but also sympathetic. Your messages will be sent via Telegram, so enrich your answers with emojis, but never use Markdown for formatting.
Be structured, quickly readable and visually intuititive.
`.trim();

function logStep(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function updateEnvFile(key: string, value: string, envFilePath = '.env') {
    try {
        logStep(`Reading environment file: ${envFilePath}`);
        const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
        const lines = envFileContent.split('\n');

        let keyUpdated = false;

        const updatedLines = lines.map((line) => {
            if (line.startsWith(`${key}=`)) {
                keyUpdated = true;
                logStep(`Updating key "${key}" in .env file`);
                return `${key}="${value}"`;
            }
            return line;
        });

        if (!keyUpdated) {
            logStep(`Key "${key}" not found in .env file, adding new entry`);
            updatedLines.push(`${key}=${value}`);
        }

        fs.writeFileSync(envFilePath, updatedLines.join('\n'));
        logStep(`Successfully updated ${key} in ${envFilePath} to ${value}`);
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Error updating .env file:`,
            error,
        );
    }
}

async function createOrUpdateAssistant(
    name: string,
    instructions: string,
    envFileKey: string,
    secretNameEnvVar: string,
) {
    logStep(`Fetching assistants list from OpenAI`);
    const assistantsList = await OPENAI_CLIENT.beta.assistants.list();

    logStep(`Searching for assistant with name: "${name}"`);
    const assistant = assistantsList.data.find(
        (assistant) => assistant.name === name,
    );

    let assistantId = assistant ? assistant.id : null;

    if (assistant) {
        logStep(`Assistant "${name}" found (id: ${assistant.id}), updating...`);
        await OPENAI_CLIENT.beta.assistants.update(assistant.id, {
            name: name,
            model: MODEL_TO_BE_USED,
            instructions: instructions,
            tools: ASSISTANT_TOOLS,
        });
        logStep(`Assistant "${name}" updated successfully.`);
    } else {
        logStep(`Assistant "${name}" not found, creating new assistant...`);
        const createdAssistant = await OPENAI_CLIENT.beta.assistants.create({
            name: name,
            model: MODEL_TO_BE_USED,
            instructions: instructions,
            tools: ASSISTANT_TOOLS,
        });
        logStep(
            `New assistant created with name "${name}" and id "${createdAssistant.id}"`,
        );
        assistantId = createdAssistant.id;
    }

    updateEnvFile(envFileKey, assistantId);
    createOrUpdateSecret(secretNameEnvVar, assistantId);
}

async function resetAssistants() {
    logStep('Starting assistant reset process...');

    await createOrUpdateAssistant(
        `${ASSISTANT_NAME} (UI)`,
        UI_ASSISTANT_INSTRUCTIONS,
        'UI_ASSISTANT_ID',
        process.env.UI_ASSISTANT_ID_SECRET_NAME,
    );

    await createOrUpdateAssistant(
        `${ASSISTANT_NAME} (Telegram)`,
        TELEGRAM_ASSISTANT_INSTRUCTIONS,
        'TELEGRAM_ASSISTANT_ID',
        process.env.TELEGRAM_ASSISTANT_ID_SECRET_NAME,
    );

    await createOrUpdateAssistant(
        `${ASSISTANT_NAME} (Reminder)`,
        ROUTINE_ASSISTANT_INSTRUCTIONS,
        'ROUTINE_ASSISTANT_ID',
        process.env.ROUTINE_ASSISTANT_ID_SECRET_NAME,
    );

    logStep('Assistants updated and secrets set.');
}

resetAssistants();
