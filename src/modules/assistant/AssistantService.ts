import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import ChatAssistant from 'src/handlers/gpt/ChatAssistant';
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

    async getChatByUserEmail(
        userEmail: string,
    ): Promise<GetConversationResponseModel> {
        let chat = await this.chatModel.findOne({ userEmail });

        if (!chat) {
            const threadId = await this.chatAssistant.startThread();

            chat = await this.chatModel.create({
                _id: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                userEmail,
                threadId,
            });
        }

        const chatMessages = await this.messageModel.find({
            chatId: chat._id,
        });

        if (chatMessages.length === 0) {
            this.logger.log(`No messages found for userEmail: ${userEmail}`);
        }

        this.logger.log(
            `Found ${chatMessages.length} messages for userEmail: ${userEmail}`,
        );

        const response = new GetConversationResponseModel(chatMessages);

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
        let chat = await this.chatModel.findOne({ userEmail: model.userEmail });

        if (!chat) {
            const threadId = await this.chatAssistant.startThread();

            chat = await this.chatModel.create({
                _id: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                userEmail: model.userEmail,
                threadId,
            });
        }

        const threadId = chat.threadId;
        const chatId = chat._id;

        await this.messageModel.create({
            _id: new mongoose.Types.ObjectId(),
            content: model.content,
            role: 'user',
            chatId: chatId,
            userChatOrigin: model.userChatOrigin,
        });

        const messageAddedToThread = streamingCallback
            ? await this.chatAssistant.addMessageToThreadByStream(
                  threadId,
                  model.content,
                  model.userEmail,
                  model.userChatOrigin === 'ui',
                  (textSnapshot: string, annotationsSnapshot: Annotation[]) => {
                      const prettifiedTextContent = this.prettifyText(
                          textSnapshot,
                          annotationsSnapshot,
                      );

                      streamingCallback(model.userEmail, prettifiedTextContent);
                  },
              )
            : await this.chatAssistant.addMessageToThread(
                  threadId,
                  model.content,
                  model.userEmail,
                  model.userChatOrigin === 'ui',
              );

        const prettifiedTextContent = this.prettifyText(
            messageAddedToThread.content,
            messageAddedToThread.annotations,
        );

        const decoratedAnnotations = await this.decorateAnnotations(
            messageAddedToThread.annotations,
        );

        if (streamingCallback) {
            streamingCallback(
                model.userEmail,
                prettifiedTextContent,
                decoratedAnnotations,
                true,
            );
        }

        await this.chatModel.updateOne(
            { _id: chatId },
            { updatedAt: new Date() },
        );

        const response = await this.messageModel.create({
            _id: new mongoose.Types.ObjectId(),
            content: prettifiedTextContent,
            role: 'assistant',
            references: decoratedAnnotations,
            chatId: chatId,
            userChatOrigin: model.userChatOrigin,
        });

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
        const distinctFileIds = this.getDistinticFileIds(annotations);

        const decoratedAnnotations: FileMetadata[] = [];

        for (const fileId of distinctFileIds) {
            const fileMetadata = await this.fileMetadataModel.findOne({
                fileId,
            });

            decoratedAnnotations.push(fileMetadata);
        }

        return decoratedAnnotations;
    }

    private getDistinticFileIds(array: Annotation[]): string[] {
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
