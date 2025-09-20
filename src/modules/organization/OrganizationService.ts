import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import GetOrganizationByIdResponseModel from './model/GetOrganizationByIdResponseModel';
import InsertOrganizationRequestModel from './model/InsertOrganizationRequestModel';
import ListOrganizationsResponseModel from './model/ListOrganizationsResponseModel';
import { Organization } from './schemas/OrganizationSchema';
import UpdateOrganizationRequestModel from './model/UpdateOrganizationRequestModel';

@Injectable()
export default class OrganizationService {
    private readonly logger: Logger = new Logger('OrganizationService');

    constructor(
        @InjectModel(Organization.name)
        private readonly organizationModel: Model<Organization>,
    ) {}

    async getOrganizationById(
        id: string,
    ): Promise<GetOrganizationByIdResponseModel | null> {
        this.logger.log(`Getting organization by ID: ${id}`);

        try {
            const organization = await this.organizationModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc?.toObject());

            if (!organization) {
                this.logger.warn(`Organization with ID ${id} not found`);
                return null;
            }

            this.logger.log(`Found organization with ID: ${id}`);

            return new GetOrganizationByIdResponseModel(
                organization._id.toString(),
                organization.collaborators.map(({ id, role }) => ({
                    id: id.toString(),
                    role,
                })),
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
                            organization.collaborators.map(({ id, role }) => ({
                                id: id.toString(),
                                role,
                            })),
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

    async updateOrganization(
        model: UpdateOrganizationRequestModel,
    ): Promise<void> {
        this.logger.log(`Updating organization with name: ${model.name}`);

        try {
            const organization = await this.organizationModel
                .findById(new mongoose.Types.ObjectId(model.id))
                .exec()
                .then((doc) => doc?.toObject());

            if (!organization) {
                this.logger.warn(`Organization with ID ${model.id} not found`);
                throw new NotFoundException();
            }

            this.logger.log(`Found organization with ID: ${model.id}`);

            await this.organizationModel.updateOne(
                { _id: organization._id },
                {
                    name: model.name,
                    collaborators: model.collaborators.map(({ id, role }) => ({
                        id: new mongoose.Types.ObjectId(id),
                        role,
                    })),
                    address: model.address,
                    phoneNumber: model.phoneNumber,
                    timezoneOffset: model.timezoneOffset,
                    updatedAt: new Date(),
                },
            );

            this.logger.log(
                `Organization with name ${organization.name} updated successfully`,
            );
        } catch (error) {
            this.logger.error(
                `Error updating organization with name ${model.name}: ${error}`,
            );
            throw error;
        }
    }

    async insertOrganization(
        model: InsertOrganizationRequestModel,
    ): Promise<{ id: string }> {
        this.logger.log(`Inserting organization with name: ${model.name}`);

        try {
            const createdResource = await this.organizationModel.create({
                _id: new mongoose.Types.ObjectId(),
                name: model.name,
                collaborators: model.collaborators.map(({ id, role }) => ({
                    id: new mongoose.Types.ObjectId(id),
                    role,
                })),
                address: model.address,
                phoneNumber: model.phoneNumber,
                timezoneOffset: model.timezoneOffset,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            this.logger.log(
                `Organization with name ${model.name} inserted successfully`,
            );

            return { id: createdResource._id.toString() };
        } catch (error) {
            this.logger.error(
                `Error inserting organization with name ${model.name}: ${error}`,
            );
            throw error;
        }
    }

    async deleteOrganizationById(id: string): Promise<void> {
        this.logger.log(
            `[deleteOrganizationById] Deleting organization with id: ${id}`,
        );

        try {
            const organization = await this.organizationModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec();

            if (!organization) {
                this.logger.warn(
                    `[deleteOrganizationById] No organization found with id: ${id}`,
                );
                throw new NotFoundException();
            }

            await this.organizationModel.deleteOne({
                _id: new mongoose.Types.ObjectId(id),
            });

            this.logger.log(
                `[deleteOrganizationById] Successfully deleted organization with id: ${id}`,
            );
        } catch (error) {
            this.logger.error(
                `[deleteOrganizationById] Error deleting organization with id: ${id}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }
}
