import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import BaseService from 'src/BaseService';
import { User } from '../user/schemas/UserSchema';
import IncomingMessageModel from './model/IncomingMessageModel';

@Injectable()
export default class TelegramService extends BaseService {
    private readonly logger: Logger = new Logger('TelegramService');
    private readonly TELEGRAM_ENDPOINT_TO_SEND_MESSAGE = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
    ) {
        super();
    }

    async handleMessage(model: IncomingMessageModel): Promise<void> {
        this.logger.log(`Incoming message details: ${JSON.stringify(model)}`);

        if (model.isBot) {
            this.logger.log(`Message coming from a bot (id: ${model.fromId})`);

            await axios.post(this.TELEGRAM_ENDPOINT_TO_SEND_MESSAGE, {
                chat_id: model.chatId,
                text: 'Beep boop! Salut my fellow bot! 🤖',
            });

            return;
        }

        if (model.chatType !== 'private') {
            this.logger.log(
                `Message coming from a non-private chat (type: ${model.chatType})`,
            );

            await axios.post(this.TELEGRAM_ENDPOINT_TO_SEND_MESSAGE, {
                chat_id: model.chatId,
                text: "Hey y'all! This bot only works in private chats. 🤖",
            });
        }

        const linkedUser = await this.userModel
            .findOne({
                telegramUserId: model.fromId,
            })
            .exec();

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
                    await axios.post(this.TELEGRAM_ENDPOINT_TO_SEND_MESSAGE, {
                        chat_id: model.chatId,
                        text: data.content,
                    });
                    this.logger.log(
                        `Sent response to Telegram user: ${model.chatId}`,
                    );
                } else {
                    this.logger.error(
                        `Error from Assistant module: ${status} - ${JSON.stringify(data)}`,
                    );

                    await axios.post(this.TELEGRAM_ENDPOINT_TO_SEND_MESSAGE, {
                        chat_id: model.chatId,
                        text: 'Oops! Something went wrong on my side. Please try again later.',
                    });
                }
            } catch (error) {
                this.logger.error(
                    `Exception while communicating with Assistant module: ${error}`,
                );
                await axios.post(this.TELEGRAM_ENDPOINT_TO_SEND_MESSAGE, {
                    chat_id: model.chatId,
                    text: 'Oops! Something went wrong on my side. Please try again later.',
                });
            }
        } else {
            this.logger.warn(
                `No linked user found for telegramUserId: ${model.fromId}`,
            );
            await axios.post(this.TELEGRAM_ENDPOINT_TO_SEND_MESSAGE, {
                chat_id: model.chatId,
                text: "Hey, mate! It looks like you haven't linked your Telegram account yet. Please do so in order to use this bot.",
            });
        }
    }
}
