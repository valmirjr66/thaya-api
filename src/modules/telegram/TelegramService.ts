import { Injectable, Logger } from '@nestjs/common';
import BaseService from 'src/BaseService';
import TelegramHandler from 'src/handlers/messaging/TelegramHandler';
import AssistantService from '../assistant/AssistantService';
import UserService from '../user/UserService';
import IncomingMessageModel from './model/IncomingMessageModel';

@Injectable()
export default class TelegramService extends BaseService {
    private readonly logger: Logger = new Logger('TelegramService');

    constructor(
        private readonly userService: UserService,
        private readonly assistantService: AssistantService,
        private readonly telegramHandler: TelegramHandler,
    ) {
        super();
    }

    async handleIncomingMessage(model: IncomingMessageModel): Promise<void> {
        this.logger.log(`Incoming message details: ${JSON.stringify(model)}`);

        if (model.isBot) {
            this.logger.log(`Message coming from a bot (id: ${model.fromId})`);

            await this.telegramHandler.sendMessage(
                model.chatId,
                'Beep boop! Salut my fellow bot! 🤖',
            );

            return;
        }

        if (model.chatType !== 'private') {
            this.logger.log(
                `Message coming from a non-private chat (type: ${model.chatType})`,
            );

            await this.telegramHandler.sendMessage(
                model.chatId,
                "Hey y'all! This bot only works in private chats. 🤖",
            );
        }

        const linkedUser = await this.userService.getUserByTelegramUserId(
            model.fromId,
        );

        if (linkedUser) {
            this.logger.log(
                `Linked user found: ${linkedUser.email} (telegramUserId: ${linkedUser.telegramUserId})`,
            );
            try {
                const assistantResponse =
                    await this.assistantService.sendMessage({
                        content: model.text,
                        userEmail: linkedUser.email,
                        userChatOrigin: 'telegram',
                    });

                this.logger.debug(
                    `Assistant response: ${JSON.stringify(assistantResponse)}`,
                );

                await this.telegramHandler.sendMessage(
                    model.chatId,
                    assistantResponse.content,
                );

                this.logger.log(
                    `Sent response to Telegram user: ${model.chatId}`,
                );
            } catch (error) {
                this.logger.error(
                    `Exception while communicating with Assistant module: ${error}`,
                );

                await this.telegramHandler.sendMessage(
                    model.chatId,
                    'Oops! Something went wrong on my side. Please try again later.',
                );
            }
        } else {
            this.logger.warn(
                `No linked user found for telegramUserId: ${model.fromId}`,
            );

            await this.telegramHandler.sendMessage(
                model.chatId,
                "Hey, mate! It looks like you haven't linked your Telegram account yet. Please do so in order to use this bot.",
            );
        }
    }
}
