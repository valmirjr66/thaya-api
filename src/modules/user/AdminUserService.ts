import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BlobStorageManager from 'src/handlers/cloud/BlobStorageManager';
import CoreCredentialService from './CoreCredentialService';
import CoreUserService from './CoreUserService';
import GetAdminUserInfoResponseModel from './model/admin/GetAdminUserInfoResponseModel';
import AuthenticateUserRequestModel from './model/AuthenticateUserRequestModel';
import { Credential } from './schemas/CredentialSchema';
import { User } from './schemas/UserSchema';

@Injectable()
export default class AdminUserService {
    private readonly coreUserService: CoreUserService;
    private readonly coreCredentialService: CoreCredentialService;

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        @InjectModel(Credential.name)
        private readonly credentialModel: Model<Credential>,
        private readonly blobStorageManager: BlobStorageManager,
    ) {
        const logger = new Logger('AdminUserService');

        this.coreUserService = new CoreUserService(
            this.userModel,
            this.credentialModel,
            this.blobStorageManager,
            logger,
        );

        this.coreCredentialService = new CoreCredentialService(
            this.credentialModel,
            this.userModel,
            logger,
        );
    }

    async authenticateUser(
        model: AuthenticateUserRequestModel,
    ): Promise<'invalid credentials' | 'email not found' | { id: string }> {
        return this.coreCredentialService.authenticateUser(model);
    }

    async getUserInfoById(
        id: string,
    ): Promise<GetAdminUserInfoResponseModel | null> {
        const response = await this.coreUserService.getUserInfoById(id);
        return new GetAdminUserInfoResponseModel(
            response.id,
            response.fullname,
            response.email,
        );
    }
}
