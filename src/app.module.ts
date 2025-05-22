import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssistantModule } from './assistant.module';

@Module({
    imports: [
        AssistantModule,
        MongooseModule.forRoot(process.env.DATABASE_URL),
    ],
})
export class AppModule {}
