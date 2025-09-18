import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BlobStorageManager from 'src/handlers/cloud/BlobStorageManager';
import CoreCredentialService from './CoreCredentialService';
import CoreUserService from './CoreUserService';
import AuthenticateUserRequestModel from './model/AuthenticateUserRequestModel';
import ChangeProfilePictureRequestModel from './model/ChangeProfilePictureRequestModel';
import GetPatientInfoResponseModel from './model/patient/GetPatientInfoResponseModel';
import InsertPatientUserRequestModel from './model/patient/InsertPatientUserRequestModel';
import ListPatientUsersInfoResponseModel from './model/patient/ListPatientUsersInfoResponseModel';
import UpdatePatientUserRequestModel from './model/patient/UpdatePatientUserRequestModel';
import { Credential } from './schemas/CredentialSchema';
import { User } from './schemas/UserSchema';

export default class PatientUserService {
    private readonly coreUserService: CoreUserService;
    private readonly coreCredentialService: CoreCredentialService;

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        @InjectModel(Credential.name)
        private readonly credentialModel: Model<Credential>,
        private readonly blobStorageManager: BlobStorageManager,
    ) {
        this.coreUserService = new CoreUserService(
            this.userModel,
            this.credentialModel,
            this.blobStorageManager,
            new Logger('PatientUserService'),
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
    ): Promise<GetPatientInfoResponseModel | null> {
        const response = await this.coreUserService.getUserInfoById(id);
        return new GetPatientInfoResponseModel(
            response.id,
            response.fullname,
            response.email,
            response.phoneNumber,
            response.birthdate,
            response.profilePicFileName,
            response.nickname,
            response.telegramUserId,
            response.telegramChatId,
        );
    }

    async insertUser(
        model: InsertPatientUserRequestModel,
    ): Promise<'existing email' | 'existing phone number' | 'inserted'> {
        return this.coreUserService.insertUser({ ...model, role: 'patient' });
    }

    async updateUser(model: UpdatePatientUserRequestModel): Promise<void> {
        return this.coreUserService.updateUser({ ...model, role: 'patient' });
    }

    async listUsers(): Promise<ListPatientUsersInfoResponseModel> {
        const response = await this.coreUserService.listUsers('patient');
        return new ListPatientUsersInfoResponseModel(
            response.items.map(
                (item) =>
                    new GetPatientInfoResponseModel(
                        item.id,
                        item.fullname,
                        item.email,
                        item.phoneNumber,
                        item.birthdate,
                        item.profilePicFileName,
                        item.nickname,
                        item.telegramUserId,
                        item.telegramChatId,
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

    async getUserByTelegramUserId(
        telegramUserId: number,
    ): Promise<GetPatientInfoResponseModel | null> {
        const response =
            await this.coreUserService.getUserByTelegramUserId(telegramUserId);

        return new GetPatientInfoResponseModel(
            response.id,
            response.fullname,
            response.email,
            response.phoneNumber,
            response.birthdate,
            response.profilePicFileName,
            response.nickname,
            response.telegramUserId,
            response.telegramChatId,
        );
    }
}
