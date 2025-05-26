import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import UserController from './modules/user/UserController';
import UserService from './modules/user/UserService';

import { User, UserSchema } from './modules/user/schemas/UserSchema';

@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
})
export class UserModule {}
