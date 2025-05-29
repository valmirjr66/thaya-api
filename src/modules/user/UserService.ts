import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BaseService from '../../BaseService';
import AuthenticateUserRequestModel from './model/AuthenticateUserRequestModel';
import GetUserInfoResponseModel from './model/GetUserInfoResponseModel';
import InsertUserRequestModel from './model/InsertUserRequestModel';
import UpdateUserRequestModel from './model/UpdateUserRequestModel';
import { Credential } from './schemas/CredentialSchema';
import { User } from './schemas/UserSchema';

@Injectable()
export default class UserService extends BaseService {
    private readonly logger: Logger = new Logger('UserService');

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        @InjectModel(Credential.name)
        private readonly credentialModel: Model<Credential>,
    ) {
        super();
    }

    async authenticateUser(
        model: AuthenticateUserRequestModel,
    ): Promise<'authenticated' | 'invalid credentials' | 'email not found'> {
        this.logger.log(
            `Authenticating user with email "${model.email}" and password "${model.password}"`,
        );

        const credential = await this.credentialModel.findOne({
            email: model.email,
        });

        if (credential) {
            this.logger.log(`Credential found for email: ${model.email}`);

            if (credential.password === model.password) {
                this.logger.log(
                    `User with email ${model.email} authenticated successfully`,
                );
                return 'authenticated';
            } else {
                this.logger.warn(
                    `Invalid credentials for email: ${model.email}`,
                );
                return 'invalid credentials';
            }
        } else {
            this.logger.warn(`Email not found: ${model.email}`);
            return 'email not found';
        }
    }

    async changePassword(
        email: string,
        newPassword: string,
    ): Promise<'updated' | 'email not found'> {
        this.logger.log(`Updating password for user with email: ${email}`);

        const credentials = await this.credentialModel.findOne({ email });

        if (!credentials) {
            this.logger.error(`User with email ${email} not found`);
            return 'email not found';
        }

        await this.credentialModel.updateOne(
            { email },
            { email, password: newPassword, updatedAt: new Date() },
        );

        this.logger.log(`Password updated for user with email: ${email}`);

        return 'updated';
    }

    async getUserInfoByEmail(
        email: string,
    ): Promise<GetUserInfoResponseModel | null> {
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

        await this.userModel.create({
            fullname: user.fullname,
            email: user.email,
            birthdate: user.birthdate,
            nickname: user.nickname,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await this.credentialModel.create({
            email: user.email,
            password: user.password,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        this.logger.log(`User with email ${user.email} inserted successfully`);
    }

    async updateUser(
        model: UpdateUserRequestModel,
    ): Promise<'invalid email' | 'updated'> {
        const email = model.email;

        this.logger.log(`Updating user with email: ${model.email}`);

        this.logger.log(`Fetching user email: ${email}`);

        const user = await this.userModel.findOne({ email }).exec();

        if (!user) {
            this.logger.error(`User with email ${email} not found`);
            return 'invalid email';
        }

        await this.userModel.updateOne(
            {
                _id: user._id,
            },
            {
                fullname: model.fullname,
                birthdate: model.birthdate,
                nickname: model.nickname,
                email: model.email,
                updatedAt: new Date(),
            },
        );

        this.logger.log(`User with email ${user.email} updated successfully`);

        return 'updated';
    }
}
