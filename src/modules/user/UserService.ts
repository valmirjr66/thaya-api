import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import BlobStorageManager from 'src/handlers/cloud/BlobStorageManager';
import { v4 as uuidv4 } from 'uuid';
import BaseService from '../../BaseService';
import AuthenticateUserRequestModel from './model/AuthenticateUserRequestModel';
import GetUserInfoResponseModel from './model/GetUserInfoResponseModel';
import InsertUserRequestModel from './model/InsertUserRequestModel';
import ListUsersResponseModel from './model/ListUsersResponseModel';
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
        public readonly blobStorageManager: BlobStorageManager,
    ) {
        super();
    }

    async authenticateUser(
        model: AuthenticateUserRequestModel,
    ): Promise<'authenticated' | 'invalid credentials' | 'email not found'> {
        this.logger.log(
            `Authenticating user with email "${model.email}" and password "${model.password}"`,
        );

        try {
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
        } catch (error) {
            this.logger.error(
                `Error authenticating user with email ${model.email}: ${error}`,
            );
            throw error;
        }
    }

    async changePassword(
        email: string,
        newPassword: string,
    ): Promise<'updated' | 'email not found'> {
        this.logger.log(`Updating password for user with email: ${email}`);

        try {
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
        } catch (error) {
            this.logger.error(
                `Error updating password for user with email ${email}: ${error}`,
            );
            throw error;
        }
    }

    async getUserInfoByEmail(
        email: string,
    ): Promise<GetUserInfoResponseModel | null> {
        this.logger.log(`Fetching user info for email: ${email}`);

        try {
            const user = await this.userModel.findOne({ email }).exec();

            if (!user) {
                this.logger.error(`User with email ${email} not found`);
                return null;
            }

            this.logger.log(
                `User info fetched for email: ${email} - fullname: ${user.fullname}`,
            );
            this.logger.debug(`User details: ${JSON.stringify(user)}`);

            return new GetUserInfoResponseModel(
                user.fullname,
                user.email,
                user.phoneNumber,
                user.birthdate,
                user.profilePicFileName,
                user.nickname,
            );
        } catch (error) {
            this.logger.error(
                `Error fetching user info for email ${email}: ${error}`,
            );
            throw error;
        }
    }

    async insertUser(
        user: InsertUserRequestModel,
    ): Promise<'existing email' | 'existing phone number' | 'inserted'> {
        this.logger.log(`Inserting user with email: ${user.email}`);

        try {
            const userWithSameEmail = await this.userModel
                .findOne({ email: user.email })
                .exec();

            const userWithSamePhoneNumber = await this.userModel
                .findOne({ phoneNumber: user.phoneNumber })
                .exec();

            if (userWithSameEmail) {
                this.logger.warn(
                    `User with email ${user.email} already exists`,
                );
                return 'existing email';
            } else if (userWithSamePhoneNumber) {
                this.logger.warn(
                    `User with phone number ${user.phoneNumber} already exists`,
                );
                return 'existing phone number';
            }

            await this.userModel.create({
                _id: new mongoose.Types.ObjectId(),
                fullname: user.fullname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                birthdate: user.birthdate,
                nickname: user.nickname,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await this.credentialModel.create({
                _id: new mongoose.Types.ObjectId(),
                email: user.email,
                password: user.password,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            this.logger.log(
                `User with email ${user.email} inserted successfully`,
            );
            return 'inserted';
        } catch (error) {
            this.logger.error(
                `Error inserting user with email ${user.email}: ${error}`,
            );
            throw error;
        }
    }

    async updateUser(
        model: UpdateUserRequestModel,
    ): Promise<'invalid email' | 'updated'> {
        const email = model.email;

        this.logger.log(`Updating user with email: ${model.email}`);

        try {
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
                    phoneNumber: model.phoneNumber,
                    updatedAt: new Date(),
                },
            );

            this.logger.log(
                `User with email ${user.email} updated successfully`,
            );

            return 'updated';
        } catch (error) {
            this.logger.error(
                `Error updating user with email ${email}: ${error}`,
            );
            throw error;
        }
    }

    async listUsers(): Promise<ListUsersResponseModel> {
        this.logger.log('Listing all users');

        try {
            const users = await this.userModel.find().exec();

            if (users.length === 0) {
                this.logger.warn('No users found');
                return new ListUsersResponseModel([]);
            }

            this.logger.log(`Found ${users.length} users`);

            return new ListUsersResponseModel(
                users.map(
                    (user) =>
                        new GetUserInfoResponseModel(
                            user.fullname,
                            user.email,
                            user.phoneNumber,
                            user.birthdate,
                            user.profilePicFileName,
                            user.nickname,
                        ),
                ),
            );
        } catch (error) {
            this.logger.error(`Error listing users: ${error}`);
            throw error;
        }
    }

    async changeProfilePicture(
        userEmail: string,
        profilePicture: Express.Multer.File,
    ) {
        this.logger.log(
            `Changing profile picture for user with email: ${userEmail}`,
        );

        try {
            const user = await this.userModel
                .findOne({ email: userEmail })
                .exec();

            if (!user) {
                this.logger.error(`User with email ${userEmail} not found`);
                return 'invalid email';
            }

            const fileExtension = profilePicture.originalname.split('.').pop();
            const profilePicFileName = `${uuidv4()}.${fileExtension}`;

            this.logger.log(
                `Uploading new profile picture for user ${userEmail}: ${profilePicFileName}`,
            );

            await this.blobStorageManager.write(
                `profile_pics/${profilePicFileName}`,
                profilePicture.buffer,
            );

            await this.userModel.updateOne(
                { _id: user._id },
                {
                    $set: {
                        profilePicFileName,
                    },
                },
            );

            this.logger.log(
                `Profile picture updated for user ${userEmail}: ${profilePicFileName}`,
            );
        } catch (error) {
            this.logger.error(
                `Error changing profile picture for user ${userEmail}: ${error}`,
            );
            throw error;
        }
    }
}
