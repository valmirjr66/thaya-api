import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import TelegramHandler from './handlers/messaging/TelegramHandler';
import TelegramController from './modules/telegram/TelegramController';
import TelegramService from './modules/telegram/TelegramService';
import { User, UserSchema } from './modules/user/schemas/UserSchema';
import UserService from './modules/user/UserService';

@Module({
    controllers: [TelegramController],
    providers: [TelegramService, TelegramHandler, UserService],
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
})
export class TelegramModule {}
