import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import ListPatientRecordsRequestModel from '../assistant/model/ListPatientRecordsRequestModel';
import GetPatientRecordResponseModel from './model/GetPatientRecordResponseModel';
import InsertPatientRecordRequestModel from './model/InsertPatientRecordRequestModel';
import ListPatientRecordsResponseModel from './model/ListPatientRecordsResponseModel';
import UpdatePatientRecordRequestModel from './model/UpdatePatientRecordRequestModel';
import { PatientRecord } from './schemas/PatientRecordSchema';

@Injectable()
export default class PatientRecordService {
    private readonly logger = new Logger('PatientRecordService');

    constructor(
        @InjectModel(PatientRecord.name)
        private readonly patientRecordModel: Model<PatientRecord>,
    ) {}

    async findAll(
        model: ListPatientRecordsRequestModel,
    ): Promise<ListPatientRecordsResponseModel> {
        try {
            this.logger.log(
                `Fetching all patient records with filter: ${JSON.stringify(model)}`,
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

            const records = await this.patientRecordModel
                .find(filter)
                .exec()
                .then((docs) => docs.map((doc) => doc.toObject()));

            if (records.length === 0) {
                this.logger.warn('No patient records found');
                return new ListPatientRecordsResponseModel([]);
            }

            this.logger.log(`Fetched ${records.length} patient records`);

            return new ListPatientRecordsResponseModel(
                records.map(
                    (record) =>
                        new GetPatientRecordResponseModel(
                            record._id.toString(),
                            record.doctorId.toString(),
                            record.patientId.toString(),
                            record.summary,
                            record.content,
                            record.series,
                        ),
                ),
            );
        } catch (error) {
            this.logger.error('Error fetching patient records', error.stack);
            throw error;
        }
    }

    async findById(id: string): Promise<GetPatientRecordResponseModel | null> {
        try {
            this.logger.log(`Fetching patient record with id: ${id}`);

            const record = await this.patientRecordModel
                .findById(id)
                .exec()
                .then((doc) => doc?.toObject() || null);

            if (record) {
                this.logger.log(`Fetched patient record with id: ${id}`);
            } else {
                this.logger.warn(`No patient record found with id: ${id}`);
                return null;
            }

            return new GetPatientRecordResponseModel(
                record._id.toString(),
                record.doctorId.toString(),
                record.patientId.toString(),
                record.summary,
                record.content,
                record.series,
            );
        } catch (error) {
            this.logger.error(
                `Error fetching patient record with id: ${id}`,
                error.stack,
            );
            throw error;
        }
    }

    async insertPatientRecord(
        model: InsertPatientRecordRequestModel,
    ): Promise<{ id: string }> {
        this.logger.log(
            `Inserting patient record for patientId ${model.patientId} and doctorId ${model.doctorId}`,
        );

        try {
            const createdPatientRecord = await this.patientRecordModel.create({
                _id: new mongoose.Types.ObjectId(),
                doctorId: new mongoose.Types.ObjectId(model.doctorId),
                patientId: new mongoose.Types.ObjectId(model.patientId),
                summary: model.summary || '',
                content: model.content || '',
                series: model.series || [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            this.logger.log(
                `Patient record for patientId ${model.patientId} inserted successfully`,
            );
            return { id: createdPatientRecord.toObject()._id.toString() };
        } catch (error) {
            this.logger.error(
                `Error inserting patient record for patientId ${model.patientId}: ${error}`,
            );
            throw error;
        }
    }

    async update(model: UpdatePatientRecordRequestModel): Promise<void> {
        this.logger.log(`Updating patient record with id: ${model.id}`);

        try {
            const updatedRecord = await this.patientRecordModel
                .findByIdAndUpdate(
                    model.id,
                    {
                        summary: model.summary,
                        content: model.content,
                        series: model.series,
                        updatedAt: new Date(),
                    },
                    { new: true },
                )
                .exec()
                .then((doc) => doc?.toObject() || null);

            if (updatedRecord) {
                this.logger.log(
                    `Patient record with id: ${model.id} updated successfully`,
                );
            } else {
                this.logger.warn(
                    `No patient record found with id: ${model.id} to update`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Error updating patient record with id: ${model.id}: ${error}`,
            );
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        this.logger.log(`Deleting patient record with id: ${id}`);

        try {
            const deletedRecord = await this.patientRecordModel
                .findByIdAndDelete(id)
                .exec()
                .then((doc) => doc?.toObject() || null);

            if (deletedRecord) {
                this.logger.log(
                    `Patient record with id: ${id} deleted successfully`,
                );
            } else {
                this.logger.warn(
                    `No patient record found with id: ${id} to delete`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Error deleting patient record with id: ${id}: ${error}`,
            );
            throw error;
        }
    }
}
