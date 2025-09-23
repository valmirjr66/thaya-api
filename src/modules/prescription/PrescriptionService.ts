import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import BlobStorageManager from 'src/handlers/cloud/BlobStorageManager';
import { PrescriptionStatus } from 'src/types/prescription';
import { v4 as uuidv4 } from 'uuid';
import GetPrescriptionResponseModel from './model/GetPrescriptionResponseModel';
import InsertPrescriptionRequestModel from './model/InsertPrescriptionRequestModel';
import ListPrescriptionsRequestModel from './model/ListPrescriptionsRequestModel';
import ListPrescriptionsResponseModel from './model/ListPrescriptionsResponseModel';
import UpdateFileRequestModel from './model/UpdateFileRequestModel';
import UpdatePrescriptionRequestModel from './model/UpdatePrescriptionRequestModel';
import { Prescription } from './schemas/PrescriptionSchema';

@Injectable()
export default class PrescriptionService {
    private readonly logger = new Logger('PrescriptionService');

    constructor(
        @InjectModel(Prescription.name)
        private readonly prescriptionModel: Model<Prescription>,
        private readonly blobStorageManager: BlobStorageManager,
    ) {}

    async findAll(
        model: ListPrescriptionsRequestModel,
    ): Promise<ListPrescriptionsResponseModel> {
        try {
            this.logger.log(
                `Fetching all prescriptions with filter: ${JSON.stringify(model)}`,
            );

            const filter = {};
            if (model.doctorId && typeof model.doctorId === 'string') {
                filter['doctorId'] = new mongoose.Types.ObjectId(
                    model.doctorId,
                );
            }
            if (model.patientId && typeof model.patientId === 'string') {
                filter['patientId'] = new mongoose.Types.ObjectId(
                    model.patientId,
                );
            }

            const prescriptions = await this.prescriptionModel
                .find(filter)
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            if (prescriptions.length === 0) {
                this.logger.warn('No prescriptions found');
                return new ListPrescriptionsResponseModel([]);
            }

            this.logger.log(`Fetched ${prescriptions.length} prescriptions`);

            return new ListPrescriptionsResponseModel(
                prescriptions.map(
                    (prescription) =>
                        new GetPrescriptionResponseModel(
                            prescription._id.toString(),
                            prescription.doctorId.toString(),
                            prescription.patientId.toString(),
                            prescription.status,
                            prescription.createdAt,
                            prescription.updatedAt,
                            prescription.fileName,
                            prescription.summary,
                        ),
                ),
            );
        } catch (error) {
            this.logger.error('Error fetching prescriptions', error.stack);
            throw error;
        }
    }

    async findById(id: string): Promise<GetPrescriptionResponseModel | null> {
        try {
            this.logger.log(`Fetching prescription with id: ${id}`);

            const prescription = await this.prescriptionModel
                .findById(id)
                .exec()
                .then((doc) => doc?.toObject() || null);

            if (prescription) {
                this.logger.log(`Fetched prescription with id: ${id}`);
            } else {
                this.logger.warn(`No prescription found with id: ${id}`);
                return null;
            }

            return new GetPrescriptionResponseModel(
                prescription._id.toString(),
                prescription.doctorId.toString(),
                prescription.patientId.toString(),
                prescription.status,
                prescription.createdAt,
                prescription.updatedAt,
                prescription.fileName,
                prescription.summary,
            );
        } catch (error) {
            this.logger.error(
                `Error fetching prescription with id: ${id}`,
                error.stack,
            );
            throw error;
        }
    }

    async insertPrescription(
        model: InsertPrescriptionRequestModel,
    ): Promise<{ id: string }> {
        this.logger.log(
            `Inserting prescription for patientId ${model.patientId} and doctorId ${model.doctorId}`,
        );

        try {
            const createdPrescription = await this.prescriptionModel
                .create({
                    _id: new mongoose.Types.ObjectId(),
                    doctorId: new mongoose.Types.ObjectId(model.doctorId),
                    patientId: new mongoose.Types.ObjectId(model.patientId),
                    status: 'draft',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .then((doc) => doc.toObject());

            this.logger.log(
                `Prescription for patientId ${model.patientId} inserted with id ${createdPrescription._id}`,
            );
            return { id: createdPrescription._id.toString() };
        } catch (error) {
            this.logger.error(
                `Error inserting prescription for patientId ${model.patientId}: ${error}`,
            );
            throw error;
        }
    }

    async update(model: UpdatePrescriptionRequestModel): Promise<void> {
        this.logger.log(`Updating prescription with id: ${model.id}`);

        try {
            const prescription = await this.prescriptionModel
                .findById(new mongoose.Types.ObjectId(model.id))
                .exec()
                .then((doc) => doc?.toObject() || null);

            if (!prescription) {
                this.logger.warn(
                    `No prescription found with id: ${model.id} to update`,
                );
                throw new NotFoundException();
            }

            if (prescription.status !== 'draft') {
                this.logger.warn(
                    `Cannot update prescription with id: ${model.id} because its status is not 'draft'`,
                );
                throw new BadRequestException(
                    `Cannot update prescription with status: ${prescription.status}`,
                );
            }

            const updatedPrescription = await this.prescriptionModel
                .findByIdAndUpdate(
                    prescription._id,
                    {
                        summary: model.summary,
                        updatedAt: new Date(),
                    },
                    { new: true },
                )
                .exec();

            if (updatedPrescription) {
                this.logger.log(
                    `prescription with id: ${model.id} updated successfully`,
                );
            } else {
                this.logger.warn(
                    `No prescription found with id: ${model.id} to update`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Error updating prescription with id: ${model.id}: ${error}`,
            );
            throw error;
        }
    }

    async delete(id: string) {
        this.logger.log(`Deleting prescription with id: ${id}`);

        try {
            const findById = await this.prescriptionModel
                .findById(id)
                .exec()
                .then((doc) => doc?.toObject() || null);

            if (!findById) {
                this.logger.warn(
                    `No prescription found with id: ${id} to delete`,
                );
                throw new NotFoundException();
            }

            if (findById.status !== 'draft') {
                this.logger.warn(
                    `Cannot delete prescription with id: ${id} because its status is not 'draft'`,
                );
                throw new Error(
                    `Cannot delete prescription with status: ${findById.status}`,
                );
            }

            const deletedRecord = await this.prescriptionModel
                .findByIdAndDelete(id)
                .exec()
                .then((doc) => doc?.toObject() || null);

            if (deletedRecord) {
                this.logger.log(
                    `Prescription with id: ${id} deleted successfully`,
                );
            } else {
                this.logger.warn(
                    `No prescription found with id: ${id} to delete`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Error deleting prescription with id: ${id}: ${error}`,
            );
            throw error;
        }
    }

    async changeFile(model: UpdateFileRequestModel) {
        this.logger.log(
            `Changing file for prescription with id: ${model.prescriptionId}`,
        );

        try {
            const fileExtension = model.file.originalname.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;

            this.logger.log(
                `Uploading new file for prescription with id ${model.prescriptionId}: ${fileName}`,
            );

            await this.blobStorageManager.write(
                `prescriptions/${fileName}`,
                model.file.buffer,
            );

            await this.prescriptionModel.updateOne(
                { _id: new mongoose.Types.ObjectId(model.prescriptionId) },
                {
                    $set: {
                        fileName: fileName,
                    },
                },
            );

            this.logger.log(
                `File changed for prescription with id ${model.prescriptionId} to ${fileName}`,
            );
        } catch (error) {
            this.logger.error(
                `Error changing file for prescription with id: ${model.prescriptionId}: ${error}`,
            );
            throw error;
        }
    }

    async removeFile(prescriptionId: string): Promise<void> {
        this.logger.log(
            `Removing file for prescription with id: ${prescriptionId}`,
        );

        try {
            const prescription = await this.prescriptionModel
                .findById(new mongoose.Types.ObjectId(prescriptionId))
                .exec();

            if (!prescription) {
                this.logger.error(
                    `No prescription found with id: ${prescriptionId}`,
                );
                return;
            }

            if (prescription.fileName) {
                this.logger.log(
                    `Removing file ${prescription.fileName} for prescription with id ${prescriptionId}`,
                );

                await this.prescriptionModel.updateOne(
                    { _id: prescription._id },
                    {
                        $set: {
                            fileName: null,
                        },
                    },
                );

                this.logger.log(
                    `File record removed from prescription with id ${prescriptionId}, deleting from storage...`,
                );
            } else {
                this.logger.log(
                    `No file to remove for prescription with id ${prescriptionId}`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Error removing file for prescription with id: ${prescriptionId}: ${error}`,
            );
            throw error;
        }
    }

    async changeStatus(
        prescriptionId: string,
        newStatus: PrescriptionStatus,
    ): Promise<void> {
        this.logger.log(
            `Changing status for prescription with id: ${prescriptionId} to ${newStatus}`,
        );

        try {
            const prescription = await this.prescriptionModel
                .findById(new mongoose.Types.ObjectId(prescriptionId))
                .exec();

            if (!prescription) {
                this.logger.error(
                    `No prescription found with id: ${prescriptionId}`,
                );
                throw new NotFoundException();
            }

            const currentStatus = prescription.toObject().status;

            if (currentStatus === 'draft') {
                if (newStatus !== 'ready') {
                    throw new Error(
                        `Invalid status transition from ${currentStatus} to ${newStatus}`,
                    );
                }
            } else if (currentStatus === 'ready') {
                if (newStatus !== 'sent' && newStatus !== 'cancelled') {
                    throw new Error(
                        `Invalid status transition from ${currentStatus} to ${newStatus}`,
                    );
                }
            } else if (
                currentStatus === 'sent' ||
                currentStatus === 'cancelled'
            ) {
                throw new Error(
                    `No valid status transitions from ${currentStatus}`,
                );
            }

            prescription.status = newStatus;
            prescription.updatedAt = new Date();

            await prescription.save();

            this.logger.log(
                `Status changed for prescription with id: ${prescriptionId} to ${newStatus}`,
            );
        } catch (error) {
            this.logger.error(
                `Error changing status for prescription with id: ${prescriptionId} to ${newStatus}: ${error}`,
            );
            throw error;
        }
    }
}
