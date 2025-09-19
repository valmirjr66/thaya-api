import * as dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import { join } from 'path';
import { CollaboratorRole } from 'src/types/user';
import BlobStorageManager from '../src/handlers/cloud/BlobStorageManager';
import askForConfirmation from './AskForConfirmation';
import {
    DEFAULT_1_DOCTOR_EMAIL,
    DEFAULT_1_PATIENT_EMAIL,
    DEFAULT_2_DOCTOR_EMAIL,
    DEFAULT_2_PATIENT_EMAIL,
    DEFAULT_ADMIN_EMAIL,
    DEFAULT_SUPPORT_EMAIL,
    DEFAULT_TELEGRAM_ID,
    DOCTOR_1_OCCURRENCES,
    DOCTOR_2_OCCURRENCES,
    shiftOccurrenceDateBy_N_Months,
} from './Utils';

dotenv.config();

const isProd = process.env.ENVIRONMENT === 'prod';

const DATABASE_URL = isProd
    ? process.env.PROD_DATABASE_URL
    : process.env.DATABASE_URL;

function pickRandomItemFromArray<T>(array: T[]): T {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function generateRandomSequenceOfDigits(length: number): string {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}

function generateRandomBirthdate(): string {
    const start = new Date(1960, 0, 1);
    const end = new Date(1990, 0, 1);
    const birthdate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
    return birthdate.toISOString().split('T')[0];
}

async function resetMongoDB() {
    if (isProd) {
        await askForConfirmation(
            'You are about to reset DB in PRODUCTION environment. Do you want to proceed?',
        );
    }

    console.log(
        `Starting assistants reset process. Environment: ${isProd ? 'Production' : 'Development'}`,
    );
    console.log(`Connecting to MongoDB at: ${DATABASE_URL}`);

    const client = new MongoClient(DATABASE_URL);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();
        const collections = await db.collections();

        console.log(
            `Found ${collections.length} collections. Clearing all collections...`,
        );
        for (const collection of collections) {
            console.log(`Clearing collection: ${collection.collectionName}`);
            const result = await collection.deleteMany({});
            console.log(
                `Cleared ${collection.collectionName}: ${result.deletedCount} documents removed.`,
            );
        }

        console.log('Inserting default organization...');
        const insertedOrganization = await db
            .collection('organizations')
            .insertOne({
                name: 'Thaya Health',
                collaborators: [],
                phoneNumber: '5531999999999',
                address: 'Belo Horizonte, MG, Brazil',
                timezoneOffset: -180,
            });
        console.log(
            `Inserted organization with _id: ${insertedOrganization.insertedId}`,
        );

        const usersToBeInserted = [
            {
                fullname: 'Rodrigo Medeiros Chaia',
                role: 'patient',
                email: DEFAULT_1_PATIENT_EMAIL,
                phoneNumber: `5531999${generateRandomSequenceOfDigits(6)}`,
                birthdate: generateRandomBirthdate(),
                profilePicFileName: 'sample1.jpg',
                nickname: 'Rô',
                telegramChatId: DEFAULT_TELEGRAM_ID,
                telegramUserId: DEFAULT_TELEGRAM_ID,
            },
            {
                fullname: 'Alex Silva Gomes',
                role: 'patient',
                email: DEFAULT_2_PATIENT_EMAIL,
                phoneNumber: `5531999${generateRandomSequenceOfDigits(6)}`,
                birthdate: generateRandomBirthdate(),
                telegramChatId: DEFAULT_TELEGRAM_ID,
                telegramUserId: DEFAULT_TELEGRAM_ID,
            },
            {
                fullname: 'Valmir Martins Júnior',
                role: 'admin',
                email: DEFAULT_ADMIN_EMAIL,
            },
            {
                fullname: 'Alessandra Matos Vieira',
                role: 'doctor',
                email: DEFAULT_1_DOCTOR_EMAIL,
                phoneNumber: `5531999${generateRandomSequenceOfDigits(6)}`,
                birthdate: generateRandomBirthdate(),
                profilePicFileName: 'sample2.jpg',
                organizationId: new mongoose.Types.ObjectId(
                    insertedOrganization.insertedId,
                ),
                occurrences: shiftOccurrenceDateBy_N_Months(
                    DOCTOR_1_OCCURRENCES,
                    0,
                ),
            },
            {
                fullname: 'Anderson Paiva Rocha',
                role: 'doctor',
                email: DEFAULT_2_DOCTOR_EMAIL,
                phoneNumber: `5531999${generateRandomSequenceOfDigits(6)}`,
                birthdate: generateRandomBirthdate(),
                profilePicFileName: 'sample3.jpg',
                organizationId: new mongoose.Types.ObjectId(
                    insertedOrganization.insertedId,
                ),
                occurrences: shiftOccurrenceDateBy_N_Months(
                    DOCTOR_2_OCCURRENCES,
                    0,
                ),
            },
            {
                fullname: 'Viviane Silva Costa',
                role: 'support',
                email: DEFAULT_SUPPORT_EMAIL,
                organizationId: new mongoose.Types.ObjectId(
                    insertedOrganization.insertedId,
                ),
            },
        ];

        const collaborators: {
            id: mongoose.Types.ObjectId;
            role: CollaboratorRole;
        }[] = [];

        const patientIds: mongoose.Types.ObjectId[] = [];

        console.log(`Inserting ${usersToBeInserted.length} users...`);

        const blobStorageManager = new BlobStorageManager();

        for (const user of usersToBeInserted) {
            console.log(`Inserting user: ${user.fullname} (${user.role})`);

            const userWithoutRole = { ...user };
            delete userWithoutRole.role;

            const insertionResponse = await db
                .collection(`${user.role}users`)
                .insertOne(userWithoutRole);

            const userId = insertionResponse.insertedId.toString();
            console.log(`Inserted user with _id: ${userId}`);

            if (user.profilePicFileName) {
                const filePath = join(
                    __dirname,
                    'assets',
                    user.profilePicFileName,
                );

                console.log(
                    `Uploading profile picture for user ${user.fullname} from ${filePath}...`,
                );

                const fileBuffer = await readFile(filePath);

                await blobStorageManager.write(
                    `profile_pics/${user.profilePicFileName}`,
                    fileBuffer,
                );

                console.log('Profile picture uploaded to blob storage.');

                console.log('User document updated with profilePicUrl.');
            }

            if (user.role === 'patient') {
                patientIds.push(new mongoose.Types.ObjectId(userId));
            }

            if (user.occurrences) {
                console.log(
                    `Inserting calendar occurrences for patient: ${user.fullname}`,
                );
                await db.collection('calendars').insertMany(
                    user.occurrences.map((occurrence) => ({
                        ...occurrence,
                        patientId: new mongoose.Types.ObjectId(
                            pickRandomItemFromArray(patientIds),
                        ),
                        userId: new mongoose.Types.ObjectId(userId),
                    })),
                );

                console.log(
                    `Inserted ${user.occurrences.length} calendar occurrences for patient.`,
                );
            } else if (user.role === 'doctor' || user.role === 'support') {
                collaborators.push({
                    id: insertionResponse.insertedId,
                    role: user.role,
                });
                console.log(`Added ${user.fullname} to collaborators list.`);
            }

            console.log(`Inserting credentials for user: ${user.email}`);
            await db.collection('credentials').insertOne({
                userId: new mongoose.Types.ObjectId(userId),
                email: user.email,
                password: '123',
            });
        }

        console.log('Updating organization with collaborators...');
        await db.collection('organizations').updateOne(
            {
                _id: insertedOrganization.insertedId,
            },
            {
                $set: {
                    collaborators: collaborators,
                },
            },
        );
        console.log('Organization updated with collaborators.');

        console.log(
            'All collections cleared and default data inserted successfully.',
        );
    } catch (error) {
        console.error('Error clearing collections:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

resetMongoDB();
