import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import ChatAssistant, { TextResponse } from 'src/handlers/gpt/ChatAssistant';
import GetConversationResponseModel from 'src/modules/assistant/model/GetChatByUserEmailResponseModel';
import { Annotation } from 'src/types/gpt';
import BaseService from '../../BaseService';
import SendMessageRequestModel from './model/SendMessageRequestModel';
import SendMessageResponseModel from './model/SendMessageResponseModel';
import { Chat } from './schemas/ChatSchema';
import { FileMetadata } from './schemas/FileMetadataSchema';
import { Message } from './schemas/MessageSchema';

@Injectable()
export default class AssistantService extends BaseService {
    private readonly logger: Logger = new Logger('AssistantService');

    constructor(
        private readonly chatAssistant: ChatAssistant,
        @InjectModel(Message.name)
        private readonly messageModel: Model<Message>,
        @InjectModel(Chat.name)
        private readonly chatModel: Model<Chat>,
        @InjectModel(FileMetadata.name)
        private readonly fileMetadataModel: Model<FileMetadata>,
    ) {
        super();
    }

    private async findUserChatAndCreateIfNotExists(
        userEmail: string,
    ): Promise<Chat> {
        let chat = await this.chatModel.findOne({ userEmail });

        if (!chat) {
            this.logger.log(
                `No chat found for userEmail: ${userEmail}. Creating new chat.`,
            );
            const threadId = await this.chatAssistant.startThread();
            this.logger.debug(`Started new thread with threadId: ${threadId}`);

            chat = await this.chatModel.create({
                _id: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                userEmail,
                threadId,
            });
            this.logger.log(
                `Created new chat for userEmail: ${userEmail} with chatId: ${chat._id}`,
            );
        } else {
            this.logger.log(
                `Found existing chat for userEmail: ${userEmail} with chatId: ${chat._id}`,
            );
        }

        return chat;
    }

    async getChatByUserEmail(
        userEmail: string,
    ): Promise<GetConversationResponseModel> {
        this.logger.debug(
            `getChatByUserEmail called with userEmail: ${userEmail}`,
        );
        const chat = await this.findUserChatAndCreateIfNotExists(userEmail);

        const chatMessages = await this.messageModel.find({
            chatId: chat._id,
        });

        if (chatMessages.length === 0) {
            this.logger.warn(`No messages found for userEmail: ${userEmail}`);
        } else {
            this.logger.log(
                `Found ${chatMessages.length} messages for userEmail: ${userEmail}`,
            );
        }

        const response = new GetConversationResponseModel(chatMessages);

        this.logger.debug(
            `Returning conversation response for userEmail: ${userEmail}`,
        );
        return response;
    }

    async sendMessage(
        model: SendMessageRequestModel,
        streamingCallback?: (
            userEmail: string,
            textSnapshot: string,
            decoratedAnnotations?: FileMetadata[],
            finished?: boolean,
        ) => void,
    ): Promise<SendMessageResponseModel> {
        this.logger.debug(
            `sendMessage called for userEmail: ${model.userEmail} with content: ${model.content}`,
        );

        const chat = await this.findUserChatAndCreateIfNotExists(
            model.userEmail,
        );

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
                `Using streamingCallback for userEmail: ${model.userEmail}`,
            );
            messageAddedToThread =
                await this.chatAssistant.addMessageToThreadByStream(
                    threadId,
                    model.content,
                    model.userEmail,
                    model.userChatOrigin === 'ui',
                    (
                        textSnapshot: string,
                        annotationsSnapshot: Annotation[],
                    ) => {
                        const prettifiedTextContent = this.prettifyText(
                            textSnapshot,
                            annotationsSnapshot,
                        );
                        this.logger.debug(
                            `Streaming snapshot for userEmail: ${model.userEmail}`,
                        );
                        streamingCallback(
                            model.userEmail,
                            prettifiedTextContent,
                        );
                    },
                );
        } else {
            this.logger.debug(
                `Using non-streaming message for userEmail: ${model.userEmail}`,
            );
            messageAddedToThread = await this.chatAssistant.addMessageToThread(
                threadId,
                model.content,
                model.userEmail,
                model.userChatOrigin === 'ui',
            );
        }

        this.logger.debug(
            `Prettifying assistant response for userEmail: ${model.userEmail}`,
        );
        const prettifiedTextContent = this.prettifyText(
            messageAddedToThread.content,
            messageAddedToThread.annotations,
        );

        this.logger.debug(
            `Decorating annotations for userEmail: ${model.userEmail}`,
        );
        const decoratedAnnotations = await this.decorateAnnotations(
            messageAddedToThread.annotations,
        );

        if (streamingCallback) {
            this.logger.debug(
                `Sending final streaming callback for userEmail: ${model.userEmail}`,
            );
            streamingCallback(
                model.userEmail,
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
        const response = await this.messageModel.create({
            _id: new mongoose.Types.ObjectId(),
            content: prettifiedTextContent,
            role: 'assistant',
            references: decoratedAnnotations,
            chatId: chatId,
            userChatOrigin: model.userChatOrigin,
        });

        this.logger.log(
            `Assistant message sent for userEmail: ${model.userEmail} with messageId: ${response.id}`,
        );

        return new SendMessageResponseModel(
            response.id,
            response.content,
            response.role,
            decoratedAnnotations,
        );
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
