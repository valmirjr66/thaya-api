import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BlobStorageManager from 'src/handlers/cloud/BlobStorageManager';
import CoreCredentialService from './CoreCredentialService';
import CoreUserService from './CoreUserService';
import AuthenticateUserRequestModel from './model/AuthenticateUserRequestModel';
import GetSupportUserInfoResponseModel from './model/support/GetSupportUserInfoResponseModel';
import InsertSupportUserRequestModel from './model/support/InsertSupportUserRequestModel';
import ListSupportUsersInfoResponseModel from './model/support/ListSupportUsersInfoResponseModel';
import UpdateSupportUserRequestModel from './model/support/UpdateSupportUserRequestModel';
import { Credential } from './schemas/CredentialSchema';
import { User } from './schemas/UserSchema';

@Injectable()
export default class SupportUserService {
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
            new Logger('SupportUserService'),
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
    ): Promise<GetSupportUserInfoResponseModel | null> {
        const response = await this.coreUserService.getUserInfoById(id);
        return new GetSupportUserInfoResponseModel(
            response.id,
            response.fullname,
            response.email,
        );
    }

    async insertUser(
        user: InsertSupportUserRequestModel,
    ): Promise<'existing email' | 'existing phone number' | 'inserted'> {
        return this.coreUserService.insertUser({ ...user, role: 'support' });
    }

    async updateUser(model: UpdateSupportUserRequestModel): Promise<void> {
        return this.coreUserService.updateUser({ ...model, role: 'support' });
    }

    async listUsers(): Promise<ListSupportUsersInfoResponseModel> {
        const response = await this.coreUserService.listUsers('support');

        return new ListSupportUsersInfoResponseModel(
            response.items.map(
                (user) =>
                    new GetSupportUserInfoResponseModel(
                        user.id,
                        user.fullname,
                        user.email,
                    ),
            ),
        );
    }
}
