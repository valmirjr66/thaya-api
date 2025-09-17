import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import ChatAssistant, { TextResponse } from 'src/handlers/gpt/ChatAssistant';
import SimpleCompletionAssistant from 'src/handlers/gpt/SimpleCompletionAssistant';
import GetChatByUserIdResponseModel from 'src/modules/assistant/model/GetChatByUserIdResponseModel';
import { Annotation } from 'src/types/gpt';
import HandleIncomingMessageRequestModel from './model/HandleIncomingMessageRequestModel';
import HandleIncomingMessageResponseModel from './model/HandleIncomingMessageResponseModel';
import { Chat } from './schemas/ChatSchema';
import { FileMetadata } from './schemas/FileMetadataSchema';
import { Message } from './schemas/MessageSchema';

@Injectable()
export default class AssistantService {
    private readonly logger: Logger = new Logger('AssistantService');

    constructor(
        private readonly chatAssistant: ChatAssistant,
        @InjectModel(Message.name)
        private readonly messageModel: Model<Message>,
        @InjectModel(Chat.name)
        private readonly chatModel: Model<Chat>,
        @InjectModel(FileMetadata.name)
        private readonly fileMetadataModel: Model<FileMetadata>,
    ) {}

    async getChatByUserId(
        userId: string,
    ): Promise<GetChatByUserIdResponseModel> {
        this.logger.debug(`getChatByUserId called with userId: ${userId}`);
        const chat = await this.findUserChatAndCreateIfNotExists(userId);

        const chatMessages = await this.messageModel.find({
            chatId: chat._id,
        });

        if (chatMessages.length === 0) {
            this.logger.warn(`No messages found for user: ${userId}`);
        } else {
            this.logger.log(
                `Found ${chatMessages.length} messages for user: ${userId}`,
            );
        }

        const response = new GetChatByUserIdResponseModel(
            chatMessages.map((item) => item.toObject()),
        );

        this.logger.debug(
            `Returning conversation response for user: ${userId}`,
        );
        return response;
    }

    async handleIncomingMessage(
        model: HandleIncomingMessageRequestModel,
        streamingCallback?: (
            userId: string,
            textSnapshot: string,
            decoratedAnnotations?: FileMetadata[],
            finished?: boolean,
        ) => void,
    ): Promise<HandleIncomingMessageResponseModel> {
        this.logger.log(
            `CHAT ORIGIN IS NOT CURRENTLY BEING USED, MUST IMPLEMENT, VALUE IS: ${model.userChatOrigin}`,
        );

        this.logger.debug(
            `handleIncomingMessage called for user: ${model.userId} with content: ${model.content}`,
        );

        const chat = await this.findUserChatAndCreateIfNotExists(model.userId);

        const threadId = chat.threadId;
        const chatId = chat._id;

        this.logger.debug(`Adding user message to chatId: ${chatId}`);
        await this.messageModel.create({
            _id: new mongoose.Types.ObjectId(),
            content: model.content,
            role: 'user',
            chatId: chatId,
            userChatOrigin: model.userChatOrigin,
        });

        let messageAddedToThread: TextResponse;
        if (streamingCallback) {
            this.logger.debug(
                `Using streamingCallback for user: ${model.userId}`,
            );
            messageAddedToThread =
                await this.chatAssistant.addMessageToThreadByStream(
                    threadId,
                    model.content,
                    model.userId,
                    (
                        textSnapshot: string,
                        annotationsSnapshot: Annotation[],
                    ) => {
                        const prettifiedTextContent = this.prettifyText(
                            textSnapshot,
                            annotationsSnapshot,
                        );
                        this.logger.debug(
                            `Streaming snapshot for user: ${model.userId}`,
                        );
                        streamingCallback(model.userId, prettifiedTextContent);
                    },
                );
        } else {
            this.logger.debug(
                `Using non-streaming message for user: ${model.userId}`,
            );
            messageAddedToThread = await this.chatAssistant.addMessageToThread(
                threadId,
                model.content,
                model.userId,
            );
        }

        this.logger.debug(
            `Prettifying assistant response for user: ${model.userId}`,
        );
        const prettifiedTextContent = this.prettifyText(
            messageAddedToThread.content,
            messageAddedToThread.annotations,
        );

        this.logger.debug(`Decorating annotations for user: ${model.userId}`);
        const decoratedAnnotations = await this.decorateAnnotations(
            messageAddedToThread.annotations,
        );

        if (streamingCallback) {
            this.logger.debug(
                `Sending final streaming callback for user: ${model.userId}`,
            );
            streamingCallback(
                model.userId,
                prettifiedTextContent,
                decoratedAnnotations,
                true,
            );
        }

        this.logger.debug(`Updating chat updatedAt for chatId: ${chatId}`);
        await this.chatModel.updateOne(
            { _id: chatId },
            { updatedAt: new Date() },
        );

        this.logger.debug(`Saving assistant message to chatId: ${chatId}`);
        const response = await this.messageModel
            .create({
                _id: new mongoose.Types.ObjectId(),
                content: prettifiedTextContent,
                role: 'assistant',
                references: decoratedAnnotations,
                chatId: chatId,
                userChatOrigin: model.userChatOrigin,
            })
            .then((doc) => doc.toObject());

        this.logger.log(
            `Assistant message sent for user: ${model.userId} with messageId: ${response._id}`,
        );

        return new HandleIncomingMessageResponseModel(
            response._id.toString(),
            response.content,
            response.role,
            decoratedAnnotations,
        );
    }

    async composeRoutineMessage(
        userName: string,
        evaluatedPeriod: string,
        agendaItems: { datetime: string; description: string }[],
    ): Promise<string> {
        this.logger.debug(
            `Composing routine message for userName: ${userName} for period: ${evaluatedPeriod} with ${agendaItems.length} agenda items`,
        );

        if (agendaItems.length === 0) {
            this.logger.warn(
                `No agenda items provided for userName: ${userName}. Returning empty message.`,
            );
            return `Hello ${userName}, you have no agenda items for the period of ${evaluatedPeriod}. Enjoy your day! 🎉`;
        }

        this.logger.debug(
            `Agenda items: ${JSON.stringify(agendaItems, null, 2)}`,
        );

        const setupMessage = `
You are Thaya, an assistant created to compose messages containing the items in the user's agenda for the given period, thus helping the user to remember their commitments. Always be concise and clear, but also sympathetic.
Your messages will be sent via Telegram, so enrich your answers with emojis, but never use Markdown.
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

        const assistant = new SimpleCompletionAssistant(setupMessage);

        const formattedAgendaItems = agendaItems
            .map((item) => `- ${item.datetime} | ${item.description}`)
            .join('\n');

        const completion = await assistant.createCompletion(
            `User ${userName} has the following events/reminder for the evaluated period of ${evaluatedPeriod}:\n${formattedAgendaItems}\n\nMake sure to compose a friendly message that will be sent.`,
        );

        return completion;
    }

    private async findUserChatAndCreateIfNotExists(
        userId: string,
    ): Promise<Chat> {
        let chat = (
            await this.chatModel.findOne({ userId }).exec()
        )?.toObject();

        if (!chat) {
            this.logger.log(
                `No chat found for user: ${userId}. Creating new chat.`,
            );
            const threadId = await this.chatAssistant.startThread();
            this.logger.debug(`Started new thread with threadId: ${threadId}`);

            chat = await this.chatModel.create({
                _id: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                userId,
                threadId,
            });
            this.logger.log(
                `Created new chat for user: ${userId} with chatId: ${chat._id}`,
            );
        } else {
            this.logger.log(
                `Found existing chat for user: ${userId} with chatId: ${chat._id}`,
            );
        }

        return chat;
    }

    private prettifyText(
        textContent: string,
        annotations: Annotation[],
    ): string {
        this.logger.debug(
            `Prettifying text content with ${annotations.length} annotations`,
        );
        let prettifiedTextContent = textContent;

        for (const annotation of annotations)
            prettifiedTextContent = prettifiedTextContent.replaceAll(
                annotation.text,
                `[${annotation.file_citation.file_id}]`,
            );

        const distinctFileIds = this.getDistinticFileIds(annotations);

        distinctFileIds.forEach((fileId, index) => {
            prettifiedTextContent = prettifiedTextContent.replaceAll(
                `[${fileId}]`,
                `<sup>[${index + 1}]</sup>`,
            );
        });

        return prettifiedTextContent;
    }

    private async decorateAnnotations(
        annotations: Annotation[],
    ): Promise<FileMetadata[]> {
        this.logger.debug(`Decorating ${annotations.length} annotations`);
        const distinctFileIds = this.getDistinticFileIds(annotations);

        const decoratedAnnotations: FileMetadata[] = [];

        for (const fileId of distinctFileIds) {
            this.logger.debug(`Fetching metadata for fileId: ${fileId}`);
            const fileMetadata = await this.fileMetadataModel.findOne({
                fileId,
            });

            decoratedAnnotations.push(fileMetadata);
        }

        return decoratedAnnotations;
    }

    private getDistinticFileIds(array: Annotation[]): string[] {
        this.logger.debug(
            `Extracting distinct file ids from ${array.length} annotations`,
        );
        const seen = new Set();
        return array
            .filter((item) => {
                const value = item.file_citation.file_id;
                if (seen.has(value)) {
                    return false;
                }
                seen.add(value);
                return true;
            })
            .map((item) => item.file_citation.file_id);
    }
}
