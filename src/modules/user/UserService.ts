import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import BaseService from '../../BaseService';
import GetUserInfoResponseModel from './model/GetUserInfoResponseModel';
import InsertUserRequestModel from './model/InsertUserRequestModel';
import { User } from './schemas/UserSchema';

@Injectable()
export default class UserService extends BaseService {
    private readonly logger: Logger = new Logger('UserService');

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
    ) {
        super();
    }

    async getUserInfo(email: string): Promise<GetUserInfoResponseModel | null> {
        this.logger.log(`Fetching user info for email: ${email}`);

        const user = await this.userModel.findOne({ email }).exec();

        if (!user) {
            this.logger.error(`User with email ${email} not found`);
            return null;
        }

        return new GetUserInfoResponseModel(
            user.fullname,
            user.email,
            user.birthdate,
            user.nickname,
        );
    }

    async insertUser(
        user: InsertUserRequestModel,
    ): Promise<'existing email' | 'inserted'> {
        this.logger.log(`Inserting user with email: ${user.email}`);

        const existingUser = await this.userModel
            .findOne({ email: user.email })
            .exec();

        if (existingUser) {
            this.logger.warn(`User with email ${user.email} already exists`);
            return 'existing email';
        }

        const newUser = new this.userModel({
            _id: uuidv4(),
            fullname: user.fullname,
            email: user.email,
            birthdate: user.birthdate,
            nickname: user.nickname,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await newUser.save();
        this.logger.log(`User with email ${user.email} inserted successfully`);
    }

    async updateUser(
        model: InsertUserRequestModel,
    ): Promise<'invalid email' | 'updated'> {
        const email = model.email;

        this.logger.log(`Updating user with email: ${model.email}`);

        this.logger.log(`Fetching user email: ${email}`);

        const user = await this.userModel.findOne({ email }).exec();

        if (!user) {
            this.logger.error(`User with email ${email} not found`);
            return 'invalid email';
        }

        await this.userModel.updateOne({
            _id: user._id,
            fullname: model.fullname,
            email: model.email,
            birthdate: model.birthdate,
            nickname: model.nickname,
            updatedAt: new Date(),
        });

        this.logger.log(`User with email ${user.email} updated successfully`);

        return 'updated';
    }
}
