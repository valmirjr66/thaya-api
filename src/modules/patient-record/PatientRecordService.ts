import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ThayaTextComposerService } from '../assistant/ThayaTextComposerService';
import { PatientUser } from '../user/schemas/PatientUserSchema';
import GetPatientRecordResponseModel from './model/GetPatientRecordResponseModel';
import InsertPatientRecordRequestModel from './model/InsertPatientRecordRequestModel';
import ListPatientRecordsRequestModel from './model/ListPatientRecordsRequestModel';
import ListPatientRecordsResponseModel from './model/ListPatientRecordsResponseModel';
import UpdatePatientRecordRequestModel from './model/UpdatePatientRecordRequestModel';
import { PatientRecord } from './schemas/PatientRecordSchema';
import { PatientRecordSeries } from './schemas/PatientRecordSeriesSchema';

@Injectable()
export default class PatientRecordService {
    private readonly logger = new Logger('PatientRecordService');

    constructor(
        @InjectModel(PatientUser.name)
        private readonly patientUserModel: Model<PatientUser>,
        @InjectModel(PatientRecord.name)
        private readonly patientRecordModel: Model<PatientRecord>,
        @InjectModel(PatientRecordSeries.name)
        private readonly patientRecordSeriesModel: Model<PatientRecordSeries>,
        private readonly thayaTextComposerService: ThayaTextComposerService,
    ) {}

    private async decoratePatientRecordWithSeries(
        record: PatientRecord,
    ): Promise<GetPatientRecordResponseModel> {
        this.logger.log(
            `Mapping series for patient record with id: ${record._id.toString()}`,
        );

        const recordSeries = await this.patientRecordSeriesModel
            .find({ _id: { $in: record.seriesIds || [] } })
            .exec()
            .then((docs) => docs.map((doc) => doc.toObject()));

        this.logger.log(
            `Mapped ${recordSeries.length} series for patient record with id: ${record._id.toString()}`,
        );

        return new GetPatientRecordResponseModel(
            record._id.toString(),
            record.doctorId.toString(),
            record.patientId.toString(),
            record.summary,
            record.content,
            recordSeries.map((serie) => ({
                id: serie._id.toString(),
                title: serie.title,
                type: serie.type,
                records: serie.records,
            })),
        );
    }

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

            const mappedRecords = await Promise.all(
                records.map((record) =>
                    this.decoratePatientRecordWithSeries(record),
                ),
            );

            return new ListPatientRecordsResponseModel(mappedRecords);
        } catch (error) {
            this.logger.error('Error fetching patient records', error.stack);
            throw error;
        }
    }

    async findById(id: string): Promise<GetPatientRecordResponseModel | null> {
        try {
            this.logger.log(`Fetching patient record with id: ${id}`);

            const record = await this.patientRecordModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc?.toObject() || null);

            if (record) {
                this.logger.log(`Fetched patient record with id: ${id}`);
            } else {
                this.logger.warn(`No patient record found with id: ${id}`);
                return null;
            }
            return this.decoratePatientRecordWithSeries(record);
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
            const createdPatientRecord = await this.patientRecordModel
                .create({
                    _id: new mongoose.Types.ObjectId(),
                    doctorId: new mongoose.Types.ObjectId(model.doctorId),
                    patientId: new mongoose.Types.ObjectId(model.patientId),
                    summary: model.summary || '',
                    content: model.content || '',
                    seriesIds: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .then((doc) => doc.toObject());

            this.logger.log(
                `Patient record for patientId ${model.patientId} inserted with id ${createdPatientRecord._id}`,
            );

            if (model.series?.length > 0) {
                const createdPatientRecordSeries =
                    await this.patientRecordSeriesModel
                        .insertMany(
                            model.series.map((serie) => ({
                                _id: new mongoose.Types.ObjectId(),
                                title: serie.title,
                                type: serie.type,
                                records: serie.records,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            })) || [],
                        )
                        .then((docs) => docs.map((doc) => doc.toObject()));

                this.logger.log(
                    `Inserted ${createdPatientRecordSeries.length} series for patient record with id ${createdPatientRecord._id}`,
                );

                await this.patientRecordModel.findByIdAndUpdate(
                    createdPatientRecord._id,
                    {
                        seriesIds: createdPatientRecordSeries.map(
                            (serie) => serie._id,
                        ),
                    },
                );
            }

            this.logger.log(
                `Patient record for patientId ${model.patientId} inserted successfully`,
            );
            return { id: createdPatientRecord._id.toString() };
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
            const updated = await this.patientRecordModel
                .findByIdAndUpdate(
                    new mongoose.Types.ObjectId(model.id),
                    {
                        summary: model.summary,
                        content: model.content,
                        updatedAt: new Date(),
                    },
                    { new: true },
                )
                .exec();

            if (updated) {
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
                .findByIdAndDelete(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc?.toObject() || null);

            if (deletedRecord) {
                this.logger.log(
                    `Patient record with id: ${id} deleted successfully`,
                );

                if (deletedRecord.seriesIds?.length > 0) {
                    const deleteResult =
                        await this.patientRecordSeriesModel.deleteMany({
                            _id: { $in: deletedRecord.seriesIds },
                        });
                    this.logger.log(
                        `Deleted ${deleteResult.deletedCount} series associated with patient record id: ${id}`,
                    );
                }
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

    async generateSummary(id: string): Promise<{ newSummary: string }> {
        this.logger.log(`Generating summary for patient record with id: ${id}`);

        try {
            const record = await this.patientRecordModel
                .findById(new mongoose.Types.ObjectId(id))
                .exec()
                .then((doc) => doc?.toObject() || null);

            if (!record) {
                this.logger.warn(
                    `No patient record found with id: ${id} to generate summary`,
                );
                throw new NotFoundException();
            }

            const patient = await this.patientUserModel.findById(
                record.patientId,
            );

            this.logger.log(
                `Generating summary for patient record with id: ${id} and patientId: ${record.patientId}`,
            );

            const generatedSummary =
                await this.thayaTextComposerService.composePatientRecordSummary(
                    record.content,
                    patient.toObject().fullname,
                );

            record.summary = generatedSummary;
            record.updatedAt = new Date();

            await this.patientRecordModel.findByIdAndUpdate(id, {
                summary: record.summary,
                updatedAt: record.updatedAt,
            });

            this.logger.log(
                `Summary generated and updated for patient record with id: ${id}`,
            );

            return { newSummary: generatedSummary };
        } catch (error) {
            this.logger.error(
                `Error generating summary for patient record with id: ${id}: ${error}`,
            );
            throw error;
        }
    }
}
