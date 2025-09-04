import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssistantModule } from './assistant.module';
import { UserModule } from './user.module';
import { TelegramModule } from './telegram.module';

@Module({
    imports: [
        AssistantModule,
        UserModule,
        TelegramModule,
        MongooseModule.forRoot(process.env.DATABASE_URL),
    ],
})
export class AppModule {}
