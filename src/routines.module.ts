import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import RoutinesController from './modules/routines/RoutinesController';
import RoutinesService from './modules/routines/RoutinesService';
import { User, UserSchema } from './modules/user/schemas/UserSchema';
import UserService from './modules/user/UserService';
import CalendarService from './modules/user/CalendarService';

@Module({
    controllers: [RoutinesController],
    providers: [RoutinesService, UserService, CalendarService],
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
})
export class RoutinesModule {}
