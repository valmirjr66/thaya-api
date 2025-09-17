import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import BlobStorageManager from 'src/handlers/cloud/BlobStorageManager';
import { v4 as uuidv4 } from 'uuid';
import BaseService from '../../BaseService';
import AuthenticateUserRequestModel from './model/AuthenticateUserRequestModel';
import ChangeProfilePictureRequestModel from './model/ChangeProfilePictureRequestModel';
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
        private readonly blobStorageManager: BlobStorageManager,
    ) {
        super();
    }

    async authenticateUser(
        model: AuthenticateUserRequestModel,
    ): Promise<'invalid credentials' | 'email not found' | { id: string }> {
        this.logger.log(
            `Authenticating user with email "${model.email}" and password "${model.password}"`,
        );

        try {
            const credential = await this.credentialModel.findOne({
                email: model.email,
            });

            if (credential) {
                this.logger.log(`Credential found for email: ${model.email}`);

                const user = await this.userModel
                    .findOne({ email: model.email })
                    .exec()
                    .then((doc) => doc.toObject());

                if (credential.password === model.password) {
                    this.logger.log(
                        `User with email ${model.email} authenticated successfully`,
                    );
                    return { id: user._id.toString() };
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
            const credentials = await this.credentialModel
                .findOne({ email })
                .exec()
                .then((doc) => doc?.toObject());

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

    async getUserInfoById(
        id: string,
    ): Promise<GetUserInfoResponseModel | null> {
        this.logger.log(`Fetching user info for id: ${id}`);

        try {
            const user = await this.userModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc.toObject());

            if (!user) {
                this.logger.error(`User with id ${id} not found`);
                return null;
            }

            this.logger.log(
                `User info fetched for id: ${id} - fullname: ${user.fullname}`,
            );
            this.logger.debug(`User details: ${JSON.stringify(user)}`);

            return new GetUserInfoResponseModel(
                user.fullname,
                user.role,
                user.email,
                user.phoneNumber,
                user.birthdate,
                user.profilePicFileName,
                user.nickname,
                user.telegramUserId,
                user.telegramChatId,
            );
        } catch (error) {
            this.logger.error(
                `Error fetching user info for id ${id}: ${error}`,
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
                .exec()
                .then((doc) => doc?.toObject());

            const userWithSamePhoneNumber = await this.userModel
                .findOne({ phoneNumber: user.phoneNumber })
                .exec()
                .then((doc) => doc?.toObject());

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
                role: user.role,
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

    async updateUser(model: UpdateUserRequestModel): Promise<void> {
        const { id } = model;

        this.logger.log(`Updating user with id: ${id}`);

        try {
            this.logger.log(`Fetching user with id: ${id}`);

            const user = await this.userModel
                .findById(new mongoose.Types.ObjectId(model.id))
                .exec()
                .then((doc) => doc.toObject());

            if (!user) {
                this.logger.error(`User with id ${id} not found`);
                throw new NotFoundException();
            }

            await this.userModel.updateOne(
                {
                    _id: user._id,
                },
                {
                    fullname: model.fullname,
                    role: model.role,
                    birthdate: model.birthdate,
                    nickname: model.nickname,
                    email: model.email,
                    phoneNumber: model.phoneNumber,
                    updatedAt: new Date(),
                },
            );

            this.logger.log(`User with id ${id} updated successfully`);
        } catch (error) {
            this.logger.error(`Error updating user with id ${id}: ${error}`);
            throw error;
        }
    }

    async listUsers(): Promise<ListUsersResponseModel> {
        this.logger.log('Listing all users');

        try {
            const users = await this.userModel
                .find()
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

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
                            user.role,
                            user.email,
                            user.phoneNumber,
                            user.birthdate,
                            user.profilePicFileName,
                            user.nickname,
                            user.telegramUserId,
                            user.telegramChatId,
                        ),
                ),
            );
        } catch (error) {
            this.logger.error(`Error listing users: ${error}`);
            throw error;
        }
    }

    async changeProfilePicture(model: ChangeProfilePictureRequestModel) {
        this.logger.log(
            `Changing profile picture for user with id: ${model.userId}`,
        );

        try {
            const user = await this.userModel
                .findById(new mongoose.Types.ObjectId(model.userId))
                .exec();

            if (!user) {
                this.logger.error(`User with id ${model.userId} not found`);
                return 'invalid email';
            }

            const fileExtension = model.profilePicture.originalname
                .split('.')
                .pop();
            const profilePicFileName = `${uuidv4()}.${fileExtension}`;

            this.logger.log(
                `Uploading new profile picture for user with id ${model.userId}: ${profilePicFileName}`,
            );

            await this.blobStorageManager.write(
                `profile_pics/${profilePicFileName}`,
                model.profilePicture.buffer,
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
                `Profile picture updated for user with id ${model.userId}: ${profilePicFileName}`,
            );
        } catch (error) {
            this.logger.error(
                `Error changing profile picture for user with id ${model.userId}: ${error}`,
            );
            throw error;
        }
    }

    async removeProfilePicture(userId: string): Promise<void> {
        this.logger.log(`Removing profile picture for user with id: ${userId}`);

        try {
            const user = await this.userModel
                .findById(new mongoose.Types.ObjectId(userId))
                .exec();

            if (!user) {
                this.logger.error(`User with id ${userId} not found`);
                return;
            }

            if (user.profilePicFileName) {
                this.logger.log(
                    `Deleting profile picture for user with id ${userId}: ${user.profilePicFileName}`,
                );

                await this.userModel.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            profilePicFileName: null,
                        },
                    },
                );

                this.logger.log(
                    `Profile picture removed for user with id ${userId}`,
                );
            } else {
                this.logger.log(
                    `No profile picture to remove for user with id ${userId}`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Error removing profile picture for user with id ${userId}: ${error}`,
            );
            throw error;
        }
    }

    async getUserByTelegramUserId(
        telegramUserId: number,
    ): Promise<User | null> {
        this.logger.log(`Fetching user with telegramUserId: ${telegramUserId}`);

        try {
            const user = await this.userModel
                .findOne({ telegramUserId })
                .exec()
                .then((doc) => doc?.toObject());

            if (!user) {
                this.logger.warn(
                    `No user found with telegramUserId: ${telegramUserId}`,
                );
                return null;
            }

            this.logger.log(
                `User found with telegramUserId: ${telegramUserId} - email: ${user.email}`,
            );
            return user;
        } catch (error) {
            this.logger.error(
                `Error fetching user with telegramUserId ${telegramUserId}: ${error}`,
            );
            throw error;
        }
    }
}
