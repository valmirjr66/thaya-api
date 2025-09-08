import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import BaseService from 'src/BaseService';
import TelegramHandler from 'src/handlers/messaging/TelegramHandler';
import UserService from '../user/UserService';
import IncomingMessageModel from './model/IncomingMessageModel';

@Injectable()
export default class TelegramService extends BaseService {
    private readonly logger: Logger = new Logger('TelegramService');

    constructor(
        private readonly userService: UserService,
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
                const { data, status } = await axios.post(
                    `${process.env.ASSISTANT_MODULE_ADDRESS}/chat/message`,
                    {
                        content: model.text,
                    },
                    {
                        headers: {
                            'x-user-email': linkedUser.email,
                            'x-user-chat-origin': 'telegram',
                        },
                    },
                );

                this.logger.log(`Assistant module response status: ${status}`);
                this.logger.debug(
                    `Assistant module response data: ${JSON.stringify(data)}`,
                );

                if (status >= 200 && status < 300) {
                    await this.telegramHandler.sendMessage(
                        model.chatId,
                        data.content,
                    );

                    this.logger.log(
                        `Sent response to Telegram user: ${model.chatId}`,
                    );
                } else {
                    this.logger.error(
                        `Error from Assistant module: ${status} - ${JSON.stringify(data)}`,
                    );

                    await this.telegramHandler.sendMessage(
                        model.chatId,
                        'Oops! Something went wrong on my side. Please try again later.',
                    );
                }
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
