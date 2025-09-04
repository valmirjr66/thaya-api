import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import TelegramController from './modules/telegram/TelegramController';
import TelegramService from './modules/telegram/TelegramService';
import { User, UserSchema } from './modules/user/schemas/UserSchema';

@Module({
    controllers: [TelegramController],
    providers: [TelegramService],
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
})
export class TelegramModule {}
