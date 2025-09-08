import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import TelegramController from './modules/telegram/TelegramController';
import TelegramService from './modules/telegram/TelegramService';
import { User, UserSchema } from './modules/user/schemas/UserSchema';
import TelegramHandler from './handlers/messaging/TelegramHandler';

@Module({
    controllers: [TelegramController],
    providers: [TelegramService, TelegramHandler],
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
})
export class TelegramModule {}
