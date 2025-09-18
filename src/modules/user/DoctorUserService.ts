import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BlobStorageManager from 'src/handlers/cloud/BlobStorageManager';
import CoreCredentialService from './CoreCredentialService';
import CoreUserService from './CoreUserService';
import AuthenticateUserRequestModel from './model/AuthenticateUserRequestModel';
import ChangeProfilePictureRequestModel from './model/ChangeProfilePictureRequestModel';
import GetDoctorInfoResponseModel from './model/doctor/GetDoctorUserInfoResponseModel';
import InsertDoctorRequestModel from './model/doctor/InsertDoctorUserRequestModel';
import ListDoctorUsersInfoResponseModel from './model/doctor/ListDoctorUsersInfoResponseModel';
import UpdateDoctorRequestModel from './model/doctor/UpdateDoctorUserRequestModel';
import { Credential } from './schemas/CredentialSchema';
import { User } from './schemas/UserSchema';

@Injectable()
export default class DoctorUserService {
    private readonly coreUserService: CoreUserService;
    private readonly coreCredentialService: CoreCredentialService;

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        @InjectModel(Credential.name)
        private readonly credentialModel: Model<Credential>,
        private readonly blobStorageManager: BlobStorageManager,
    ) {
        const logger = new Logger('DoctorUserService');

        this.coreUserService = new CoreUserService(
            this.userModel,
            this.credentialModel,
            this.blobStorageManager,
            logger,
        );

        this.coreCredentialService = new CoreCredentialService(
            this.credentialModel,
            logger,
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
    ): Promise<GetDoctorInfoResponseModel | null> {
        const response = await this.coreUserService.getUserInfoById(id);
        return new GetDoctorInfoResponseModel(
            response.id,
            response.fullname,
            response.email,
            response.phoneNumber,
            response.birthdate,
            response.profilePicFileName,
        );
    }

    async insertUser(
        model: InsertDoctorRequestModel,
    ): Promise<'existing email' | 'existing phone number' | 'inserted'> {
        return this.coreUserService.insertUser({ ...model, role: 'doctor' });
    }

    async updateUser(model: UpdateDoctorRequestModel): Promise<void> {
        return this.coreUserService.updateUser({ ...model, role: 'doctor' });
    }

    async listUsers(): Promise<ListDoctorUsersInfoResponseModel> {
        const response = await this.coreUserService.listUsers('doctor');

        return new ListDoctorUsersInfoResponseModel(
            response.items.map(
                (user) =>
                    new GetDoctorInfoResponseModel(
                        user.id,
                        user.fullname,
                        user.email,
                        user.phoneNumber,
                        user.birthdate,
                        user.profilePicFileName,
                    ),
            ),
        );
    }

    async changeProfilePicture(model: ChangeProfilePictureRequestModel) {
        return this.coreUserService.changeProfilePicture(model);
    }

    async removeProfilePicture(userId: string): Promise<void> {
        return this.coreUserService.removeProfilePicture(userId);
    }
}
