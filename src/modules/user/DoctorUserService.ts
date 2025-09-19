import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import BlobStorageManager from 'src/handlers/cloud/BlobStorageManager';
import { v4 as uuidv4 } from 'uuid';
import { Organization } from '../organization/schemas/OrganizationSchema';
import CoreCredentialService from './CoreCredentialService';
import AuthenticateUserRequestModel from './model/AuthenticateUserRequestModel';
import ChangeProfilePictureRequestModel from './model/ChangeProfilePictureRequestModel';
import GetDoctorUserInfoResponseModel from './model/doctor/GetDoctorUserInfoResponseModel';
import InsertDoctorRequestModel from './model/doctor/InsertDoctorUserRequestModel';
import ListDoctorUsersInfoResponseModel from './model/doctor/ListDoctorUsersInfoResponseModel';
import ListLinkedPatientsResponseModel from './model/doctor/ListLinkedPatientsResponseModel';
import UpdateDoctorRequestModel from './model/doctor/UpdateDoctorUserRequestModel';
import { Credential } from './schemas/CredentialSchema';
import { DoctorUser } from './schemas/DoctorUserSchema';
import { PatientUser } from './schemas/PatientUserSchema';

@Injectable()
export default class DoctorUserService {
    private readonly coreCredentialService: CoreCredentialService;
    private readonly logger = new Logger('DoctorUserService');

    constructor(
        @InjectModel(DoctorUser.name)
        private readonly userModel: Model<DoctorUser>,
        @InjectModel(PatientUser.name)
        private readonly patientUserModel: Model<PatientUser>,
        @InjectModel(Credential.name)
        private readonly credentialModel: Model<Credential>,
        @InjectModel(Organization.name)
        private readonly organizationModel: Model<Organization>,
        private readonly blobStorageManager: BlobStorageManager,
    ) {
        this.coreCredentialService = new CoreCredentialService(
            this.credentialModel,
            this.logger,
        );
    }

    async authenticateUser(
        model: AuthenticateUserRequestModel,
    ): Promise<'invalid credentials' | 'email not found' | { id: string }> {
        return this.coreCredentialService.authenticateUser(model);
    }

    async changePassword(
        email: string,
        newPassword: string,
    ): Promise<'updated' | 'email not found'> {
        return this.coreCredentialService.changePassword(email, newPassword);
    }

    async getUserInfoById(
        id: string,
    ): Promise<GetDoctorUserInfoResponseModel | null> {
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

            return new GetDoctorUserInfoResponseModel(
                user._id.toString(),
                user.organizationId.toString(),
                user.fullname,
                user.email,
                user.phoneNumber,
                user.birthdate,
                user.profilePicFileName,
            );
        } catch (error) {
            this.logger.error(
                `Error fetching user info for id ${id}: ${error}`,
            );
            throw error;
        }
    }

    async deleteUserById(id: string): Promise<void> {
        this.logger.log(`Deleting user with id: ${id}`);

        try {
            const user = await this.userModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc?.toObject());

            if (!user) {
                this.logger.error(`User with id ${id} not found`);
                throw new NotFoundException();
            }

            await this.credentialModel.deleteOne({
                userId: new mongoose.Types.ObjectId(id),
            });

            this.logger.log(`Credentials deleted for user id: ${id}`);

            await this.userModel.deleteOne({ _id: user._id });

            this.logger.log(`User with id ${id} deleted successfully`);

            await this.organizationModel.updateOne(
                { _id: new mongoose.Types.ObjectId(user.organizationId) },
                { $pull: { collaborators: { id: user._id } } },
            );

            this.logger.log(
                `User with id ${id} removed from organization ${user.organizationId}`,
            );

            if (user.profilePicFileName) {
                this.logger.log(
                    `Deleting profile picture for user with id ${id}: ${user.profilePicFileName}`,
                );

                await this.blobStorageManager.delete(
                    `profile_pics/${user.profilePicFileName}`,
                );

                this.logger.log(
                    `Profile picture deleted for user with id ${id}`,
                );
            }
        } catch (error) {
            this.logger.error(`Error deleting user with id ${id}: ${error}`);
            throw error;
        }
    }

    async insertUser(
        model: InsertDoctorRequestModel,
    ): Promise<'existing email' | 'existing phone number' | { id: string }> {
        this.logger.log(`Inserting user with email: ${model.email}`);

        try {
            const userWithSameEmail = await this.userModel
                .findOne({ email: model.email })
                .exec()
                .then((doc) => doc?.toObject());

            const userWithSamePhoneNumber = await this.userModel
                .findOne({ phoneNumber: model.phoneNumber })
                .exec()
                .then((doc) => doc?.toObject());

            if (userWithSameEmail) {
                this.logger.warn(
                    `User with email ${model.email} already exists`,
                );
                return 'existing email';
            } else if (userWithSamePhoneNumber) {
                this.logger.warn(
                    `User with phone number ${model.phoneNumber} already exists`,
                );
                return 'existing phone number';
            }

            const createdUser = await this.userModel.create({
                _id: new mongoose.Types.ObjectId(),
                organizationId: new mongoose.Types.ObjectId(
                    model.organizationId,
                ),
                fullname: model.fullname,
                email: model.email,
                phoneNumber: model.phoneNumber,
                birthdate: model.birthdate,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            this.logger.log(
                `User with email ${model.email} created successfully with id ${createdUser._id}`,
            );

            await this.organizationModel.updateOne(
                { _id: new mongoose.Types.ObjectId(model.organizationId) },
                {
                    $addToSet: {
                        collaborators: { id: createdUser._id, role: 'doctor' },
                    },
                },
            );

            this.logger.log(
                `User with id ${createdUser._id} added to organization ${model.organizationId}`,
            );

            await this.credentialModel.create({
                _id: new mongoose.Types.ObjectId(),
                userId: createdUser.toObject()._id,
                email: model.email,
                password: model.password,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            this.logger.log(
                `User with email ${model.email} inserted successfully`,
            );
            return { id: createdUser.toObject()._id.toString() };
        } catch (error) {
            this.logger.error(
                `Error inserting user with email ${model.email}: ${error}`,
            );
            throw error;
        }
    }

    async updateUser(model: UpdateDoctorRequestModel): Promise<void> {
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
                    birthdate: model.birthdate,
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

    async listUsers(): Promise<ListDoctorUsersInfoResponseModel> {
        this.logger.log('Listing all users');

        try {
            const users = await this.userModel
                .find()
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            if (users.length === 0) {
                this.logger.warn('No users found');
                return new ListDoctorUsersInfoResponseModel([]);
            }

            this.logger.log(`Found ${users.length} users`);

            return new ListDoctorUsersInfoResponseModel(
                users.map(
                    (user) =>
                        new GetDoctorUserInfoResponseModel(
                            user._id.toString(),
                            user.organizationId.toString(),
                            user.fullname,
                            user.email,
                            user.phoneNumber,
                            user.birthdate,
                            user.profilePicFileName,
                        ),
                ),
            );
        } catch (error) {
            this.logger.error(`Error listing users: ${error}`);
            throw error;
        }
    }

    async listLinkedPatients(doctorId: string) {
        this.logger.log(`Listing patients for doctor with id: ${doctorId}`);

        try {
            const doctor = await this.userModel
                .findById(new mongoose.Types.ObjectId(doctorId))
                .exec()
                .then((doc) => doc?.toObject());

            if (!doctor) {
                this.logger.error(`Doctor with id ${doctorId} not found`);
                throw new NotFoundException();
            }

            const patients = await this.patientUserModel
                .find({
                    doctorsId: { $in: [new mongoose.Types.ObjectId(doctorId)] },
                })
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            this.logger.log(
                `Found ${patients.length} patients for doctor with id: ${doctorId}`,
            );

            return new ListLinkedPatientsResponseModel(
                patients.map((item) => ({
                    id: item._id.toString(),
                    fullname: item.fullname,
                    nickname: item.nickname,
                })),
            );
        } catch (error) {
            this.logger.error(
                `Error listing patients for doctor with id ${doctorId}: ${error}`,
            );
            throw error;
        }
    }

    async changeProfilePicture(model: ChangeProfilePictureRequestModel) {
        this.logger.log(
            `Changing profile picture for user with id: ${model.userId}`,
        );

        try {
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
                { _id: new mongoose.Types.ObjectId(model.userId) },
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
}
