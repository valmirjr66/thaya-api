import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import BaseService from '../../BaseService';
import GetOrganizationByIdResponseModel from './model/GetOrganizationByIdResponseModel';
import ListOrganizationsResponseModel from './model/ListOrganizationsResponseModel';
import { Organization } from './schemas/OrganizationSchema';
import InsertOrganizationRequestModel from './model/InsertOrganizationRequestModel';

@Injectable()
export default class OrganizationService extends BaseService {
    private readonly logger: Logger = new Logger('OrganizationService');

    constructor(
        @InjectModel(Organization.name)
        private readonly organizationModel: Model<Organization>,
    ) {
        super();
    }

    async getOrganizationById(
        id: string,
    ): Promise<GetOrganizationByIdResponseModel | null> {
        this.logger.log(`Getting organization by ID: ${id}`);

        try {
            const organization = await this.organizationModel
                .findById(id)
                .exec()
                .then((doc) => doc.toObject());

            if (!organization) {
                this.logger.warn(`Organization with ID ${id} not found`);
                return null;
            }

            this.logger.log(`Found organization with ID: ${id}`);

            return new GetOrganizationByIdResponseModel(
                organization._id.toString(),
                organization.collaborators.map((id) => id.toString()),
                organization.name,
                organization.address,
                organization.phoneNumber,
                organization.timezoneOffset,
            );
        } catch (error) {
            this.logger.error(`Error getting organization by ID: ${error}`);
            throw error;
        }
    }

    async listOrganizations(): Promise<ListOrganizationsResponseModel> {
        this.logger.log('Listing all organizations');

        try {
            const organizations = await this.organizationModel
                .find()
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            if (organizations.length === 0) {
                this.logger.warn('No organization found');
                return new ListOrganizationsResponseModel([]);
            }

            this.logger.log(`Found ${organizations.length} organizations`);

            return new ListOrganizationsResponseModel(
                organizations.map(
                    (organization) =>
                        new GetOrganizationByIdResponseModel(
                            organization._id.toString(),
                            organization.collaborators.map((id) =>
                                id.toString(),
                            ),
                            organization.name,
                            organization.address,
                            organization.phoneNumber,
                            organization.timezoneOffset,
                        ),
                ),
            );
        } catch (error) {
            this.logger.error(`Error listing organizations: ${error}`);
            throw error;
        }
    }

    async insertOrganization(
        organization: InsertOrganizationRequestModel,
    ): Promise<void> {
        this.logger.log(
            `Inserting organization with name: ${organization.name}`,
        );

        try {
            await this.organizationModel.create({
                _id: new mongoose.Types.ObjectId(),
                name: organization.name,
                collaborators: organization.collaborators,
                address: organization.address,
                phoneNumber: organization.phoneNumber,
                timezoneOffset: organization.timezoneOffset,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            this.logger.log(
                `Organization with name ${organization.name} inserted successfully`,
            );
        } catch (error) {
            this.logger.error(
                `Error inserting organization with name ${organization.name}: ${error}`,
            );
            throw error;
        }
    }
}
