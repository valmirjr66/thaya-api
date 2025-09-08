import { Module } from '@nestjs/common';
import RoutinesController from './modules/routines/RoutinesController';
import RoutinesService from './modules/routines/RoutinesService';
import CalendarService from './modules/user/CalendarService';
import UserService from './modules/user/UserService';

@Module({
    controllers: [RoutinesController],
    providers: [RoutinesService, UserService, CalendarService],
})
export class RoutinesModule {}
