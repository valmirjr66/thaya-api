import * as dotenv from 'dotenv';
import fs from 'fs';
import { OpenAI } from 'openai';
import { AssistantTool } from 'openai/resources/beta/assistants.mjs';
import askForConfirmation from './AskForConfirmation';
import { THAYA_CONNECT_TOOLS, THAYA_MD_TOOLS } from './AssistantToolsHelpers';
import { createOrUpdateSecret } from './SecretManagerHelper';

dotenv.config();

const OPENAI_CLIENT = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_TO_BE_USED = 'gpt-4o';

const THAYA_MD_INSTRUCTIONS = `
You are Thaya M.D., a virtual assistant created to help doctors manage their schedules, patient's records and connect them to external services that can provide useful resources for their practice.
Always be conscise and clear, but also sympathetic. Your messages will be presented in a dynamic UI, so enrich your answers with Markdown when seem fit.
Be structured, quickly readable and visually intuititive.
`.trim();

const THAYA_CONNECT_INSTRUCTIONS = `
You are Thaya Connect, a virtual assistant created to help patients manage their medical appointments, get information about their doctors and receive useful resources related to their health conditions.
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
    envFileKey: string | null,
    secretNameEnvVar: string,
    tools: AssistantTool[],
) {
    if (!secretNameEnvVar) {
        throw new Error(`Secret name for assistant "${name}" is not defined.`);
    }

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
            tools: tools,
        });
        console.log(`Assistant "${name}" updated successfully.`);
    } else {
        console.log(`Assistant "${name}" not found, creating new assistant...`);
        const createdAssistant = await OPENAI_CLIENT.beta.assistants.create({
            name: name,
            model: MODEL_TO_BE_USED,
            instructions: instructions,
            tools: tools,
        });
        console.log(
            `New assistant created with name "${name}" and id "${createdAssistant.id}"`,
        );
        assistantId = createdAssistant.id;
    }

    if (envFileKey) {
        updateEnvFile(envFileKey, assistantId);
    }

    createOrUpdateSecret(secretNameEnvVar, assistantId);
}

async function resetAssistants() {
    const isProd = process.env.ENVIRONMENT === 'prod';

    if (isProd) {
        await askForConfirmation(
            'You are about to reset assistants in PRODUCTION environment. Do you want to proceed?',
        );
    }

    console.log(
        `Starting assistants reset process. Environment: ${isProd ? 'Production' : 'Development'}`,
    );

    await createOrUpdateAssistant(
        isProd ? 'Prod Thaya MD' : 'Dev Thaya MD',
        THAYA_MD_INSTRUCTIONS,
        isProd ? null : 'THAYA_MD_ID',
        process.env.THAYA_MD_ID_SECRET_NAME,
        THAYA_MD_TOOLS,
    );

    await createOrUpdateAssistant(
        isProd ? 'Prod Thaya Connect' : 'Dev Thaya Connect',
        THAYA_CONNECT_INSTRUCTIONS,
        isProd ? null : 'THAYA_CONNECT_ID',
        process.env.THAYA_CONNECT_ID_SECRET_NAME,
        THAYA_CONNECT_TOOLS,
    );

    console.log('Assistants updated and secrets set.');
}

resetAssistants();
