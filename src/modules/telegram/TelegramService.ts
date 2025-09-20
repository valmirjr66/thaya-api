import { Injectable, Logger } from '@nestjs/common';
import TelegramHandler from 'src/handlers/messaging/TelegramHandler';
import ThayaConnectService from '../assistant/ThayaConnectService';
import PatientUserService from '../user/PatientUserService';
import IncomingMessageModel from './model/IncomingMessageModel';

@Injectable()
export default class TelegramService {
    private readonly logger: Logger = new Logger('TelegramService');

    constructor(
        private readonly patientUserService: PatientUserService,
        private readonly thayaConnectService: ThayaConnectService,
        private readonly telegramHandler: TelegramHandler,
    ) {}

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

        const linkedUser =
            await this.patientUserService.getUserByTelegramUserId(model.fromId);

        if (linkedUser) {
            this.logger.log(
                `Linked user found: ${linkedUser.email} (telegramUserId: ${linkedUser.telegramUserId})`,
            );
            try {
                const assistantResponse =
                    await this.thayaConnectService.handleIncomingMessage({
                        content: model.text,
                        userId: linkedUser.id,
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
