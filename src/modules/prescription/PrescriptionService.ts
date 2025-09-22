import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import GetPrescriptionResponseModel from './model/GetPrescriptionResponseModel';
import InsertPrescriptionRequestModel from './model/InsertPrescriptionRequestModel';
import ListPrescriptionsRequestModel from './model/ListPrescriptionsRequestModel';
import ListPrescriptionsResponseModel from './model/ListPrescriptionsResponseModel';
import UpdatePrescriptionRequestModel from './model/UpdatePrescriptionRequestModel';
import { Prescription } from './schemas/PrescriptionSchema';

@Injectable()
export default class PrescriptionService {
    private readonly logger = new Logger('PrescriptionService');

    constructor(
        @InjectModel(Prescription.name)
        private readonly prescriptionModel: Model<Prescription>,
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
            const updatedPrescription = await this.prescriptionModel
                .findByIdAndUpdate(
                    model.id,
                    {
                        summary: model.summary,
                        updatedAt: new Date(),
                    },
                    { new: true },
                )
                .exec()
                .then((doc) => doc?.toObject() || null);

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
}
