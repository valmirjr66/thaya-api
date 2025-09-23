import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import CalendarTool from 'src/handlers/gen-ai/CalendarTool';
import ChatAssistant, { TextResponse } from 'src/handlers/gen-ai/ChatAssistant';
import UserInfoTool from 'src/handlers/gen-ai/UserInfoTool';
import GetChatByUserIdResponseModel from 'src/modules/assistant/model/GetChatByUserIdResponseModel';
import { Annotation } from 'src/types/gen-ai';
import GetMessageResponseModel from './model/GetMessageResponseModel';
import HandleIncomingMessageRequestModel from './model/HandleIncomingMessageRequestModel';
import HandleIncomingMessageResponseModel from './model/HandleIncomingMessageResponseModel';
import { FileMetadata } from './schemas/FileMetadataSchema';
import { Message } from './schemas/MessageSchema';
import { ThayaMDChat } from './schemas/ThayaMDChatSchema';

@Injectable()
export default class ThayaMDService {
    private readonly logger: Logger = new Logger('ThayaMDService');
    private readonly chatAssistant: ChatAssistant;

    constructor(
        private readonly userInfoTool: UserInfoTool,
        private readonly calendarTool: CalendarTool,
        @InjectModel(Message.name)
        private readonly messageModel: Model<Message>,
        @InjectModel(ThayaMDChat.name)
        private readonly thayaMDChatModel: Model<ThayaMDChat>,
        @InjectModel(FileMetadata.name)
        private readonly fileMetadataModel: Model<FileMetadata>,
    ) {
        this.chatAssistant = new ChatAssistant(
            this.userInfoTool,
            this.calendarTool,
            'thaya-m.d.',
        );
    }

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
            chatMessages.map((item) => {
                const pojoItem = item.toObject();
                return new GetMessageResponseModel(
                    pojoItem._id.toString(),
                    pojoItem.content,
                    pojoItem.createdAt,
                    pojoItem.role,
                    chat._id.toString(),
                    pojoItem.references,
                );
            }),
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
        await this.thayaMDChatModel.updateOne(
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

    private async findUserChatAndCreateIfNotExists(
        userId: string,
    ): Promise<ThayaMDChat> {
        let chat = (
            await this.thayaMDChatModel.findOne({ userId }).exec()
        )?.toObject();

        if (!chat) {
            this.logger.log(
                `No chat found for user: ${userId}. Creating new chat.`,
            );
            const threadId = await this.chatAssistant.startThread();
            this.logger.debug(`Started new thread with threadId: ${threadId}`);

            chat = await this.thayaMDChatModel.create({
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
