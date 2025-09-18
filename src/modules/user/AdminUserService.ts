import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import CoreCredentialService from './CoreCredentialService';
import GetAdminUserInfoResponseModel from './model/admin/GetAdminUserInfoResponseModel';
import AuthenticateUserRequestModel from './model/AuthenticateUserRequestModel';
import { AdminUser } from './schemas/AdminUserSchema';
import { Credential } from './schemas/CredentialSchema';

@Injectable()
export default class AdminUserService {
    private readonly coreCredentialService: CoreCredentialService;
    private readonly logger = new Logger('AdminUserService');

    constructor(
        @InjectModel(AdminUser.name)
        private readonly userModel: Model<AdminUser>,
        @InjectModel(Credential.name)
        private readonly credentialModel: Model<Credential>,
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

    async getUserInfoById(
        id: string,
    ): Promise<GetAdminUserInfoResponseModel | null> {
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
                `User info fetched for id: ${id} - fullname: ${user}`,
            );
            this.logger.debug(`User details: ${JSON.stringify(user)}`);

            return new GetAdminUserInfoResponseModel(
                user._id.toString(),
                user.fullname,
                user.email,
            );
        } catch (error) {
            this.logger.error(
                `Error fetching user info for id ${id}: ${error}`,
            );
            throw error;
        }
    }
}
