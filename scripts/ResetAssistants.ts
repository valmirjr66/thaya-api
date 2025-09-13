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

const UI_ASSISTANT_INSTRUCTIONS = `
You are Thaya, a personal day-to-day assistant, created to help users manage agenda and answer me with helpful information made available by external services.
Always be conscise and clear, but also sympathetic. Your messages will be presented in a dynamic UI, so enrich your answers with emojis and Markdown for formatting when seem fit.
Be structured, quickly readable and visually intuititive.
`.trim();

const TELEGRAM_ASSISTANT_INSTRUCTIONS = `
You are Thaya, a personal day-to-day assistant, created to help users manage agenda and answer me with helpful information made available by external services.
Always be conscise and clear, but also sympathetic. Your messages will be presented in a Telegram chat, so enrich your answers with emojis, but never use Markdown.
If formatting is needed, you have following options available:
    <b>bold</b>

    <i>italic</i>

    <u>underline</u>

    <s>strikethrough</s>

    <a href="https://www.someurl.com">Link</a>

    <code>inline code</code>
    <pre>
    multiline
    code block
    </pre>
Be structured, quickly readable and visually intuititive.
`.trim();

function updateEnvFile(key: string, value: string, envFilePath = '.env') {
    try {
        console.log(`Reading environment file: ${envFilePath}`);
        const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
        const lines = envFileContent.split('\n');

        let keyUpdated = false;

        const updatedLines = lines.map((line) => {
            if (line.startsWith(`${key}=`)) {
                keyUpdated = true;
                console.log(`Updating key "${key}" in .env file`);
                return `${key}="${value}"`;
            }
            return line;
        });

        if (!keyUpdated) {
            console.log(
                `Key "${key}" not found in .env file, adding new entry`,
            );
            updatedLines.push(`${key}=${value}`);
        }

        fs.writeFileSync(envFilePath, updatedLines.join('\n'));
        console.log(
            `Successfully updated ${key} in ${envFilePath} to ${value}`,
        );
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
    console.log(`Fetching assistants list from OpenAI`);
    const assistantsList = await OPENAI_CLIENT.beta.assistants.list();

    console.log(`Searching for assistant with name: "${name}"`);
    const assistant = assistantsList.data.find(
        (assistant) => assistant.name === name,
    );

    let assistantId = assistant ? assistant.id : null;

    if (assistant) {
        console.log(
            `Assistant "${name}" found (id: ${assistant.id}), updating...`,
        );
        await OPENAI_CLIENT.beta.assistants.update(assistant.id, {
            name: name,
            model: MODEL_TO_BE_USED,
            instructions: instructions,
            tools: ASSISTANT_TOOLS,
        });
        console.log(`Assistant "${name}" updated successfully.`);
    } else {
        console.log(`Assistant "${name}" not found, creating new assistant...`);
        const createdAssistant = await OPENAI_CLIENT.beta.assistants.create({
            name: name,
            model: MODEL_TO_BE_USED,
            instructions: instructions,
            tools: ASSISTANT_TOOLS,
        });
        console.log(
            `New assistant created with name "${name}" and id "${createdAssistant.id}"`,
        );
        assistantId = createdAssistant.id;
    }

    updateEnvFile(envFileKey, assistantId);
    createOrUpdateSecret(secretNameEnvVar, assistantId);
}

async function resetAssistants() {
    const isProd = process.env.ENVIRONMENT === 'prod';

    if (isProd) {
    }

    console.log(
        `Starting assistants reset process. Environment: ${isProd ? 'Production' : 'Development'}`,
    );

    await createOrUpdateAssistant(
        'Thaya (UI)',
        UI_ASSISTANT_INSTRUCTIONS,
        'UI_ASSISTANT_ID',
        process.env.UI_ASSISTANT_ID_SECRET_NAME,
    );

    await createOrUpdateAssistant(
        'Thaya (Telegram)',
        TELEGRAM_ASSISTANT_INSTRUCTIONS,
        'TELEGRAM_ASSISTANT_ID',
        process.env.TELEGRAM_ASSISTANT_ID_SECRET_NAME,
    );

    console.log('Assistants updated and secrets set.');
}

resetAssistants();
