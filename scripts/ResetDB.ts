import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import askForConfirmation from './AskForConfirmation';
import {
    DEFAULT_1_DOCTOR_EMAIL,
    DEFAULT_2_DOCTOR_EMAIL,
    DEFAULT_ADMIN_EMAIL,
    DEFAULT_PATIENT_EMAIL,
    DEFAULT_SUPPORT_EMAIL,
    OCCURRENCES,
} from './Utils';

dotenv.config();

const isProd = process.env.ENVIRONMENT === 'prod';

const DATABASE_URL = isProd
    ? process.env.PROD_DATABASE_URL
    : process.env.DATABASE_URL;

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
            'You are about to reset DB in PRODUCTION environment. This is a potentially destructive operation. Do you want to proceed?',
        );
        await askForConfirmation('Are you realy realy sure?');
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
                profilePicFileName: 'sample1.jpg',
                organizationId: new mongoose.Types.ObjectId(
                    insertedOrganization.insertedId,
                ),
            },
            {
                fullname: 'Juliana Andrade Santos',
                role: 'doctor',
                email: DEFAULT_2_DOCTOR_EMAIL,
                phoneNumber: `5531999${generateRandomSequenceOfDigits(6)}`,
                birthdate: generateRandomBirthdate(),
                profilePicFileName: 'sample1.jpg',
                organizationId: new mongoose.Types.ObjectId(
                    insertedOrganization.insertedId,
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
            {
                fullname: 'Rodrigo Medeiros Chaia',
                role: 'patient',
                email: DEFAULT_PATIENT_EMAIL,
                phoneNumber: `5531999${generateRandomSequenceOfDigits(6)}`,
                birthdate: generateRandomBirthdate(),
                profilePicFileName: 'sample1.jpg',
                nickname: 'Rô',
                telegramChatId: 761249989,
                telegramUserId: 761249989,
            },
        ];

        const collaborators: mongoose.Types.ObjectId[] = [];

        console.log(`Inserting ${usersToBeInserted.length} users...`);
        for (const user of usersToBeInserted) {
            console.log(`Inserting user: ${user.fullname} (${user.role})`);
            const insertionResponse = await db
                .collection(`${user.role}users`)
                .insertOne(user);

            const userId = insertionResponse.insertedId.toString();
            console.log(`Inserted user with _id: ${userId}`);

            if (user.role === 'patient') {
                console.log(
                    `Inserting calendar occurrences for patient: ${user.fullname}`,
                );
                await db.collection('calendars').insertMany(
                    OCCURRENCES.map((occurrence) => ({
                        ...occurrence,
                        userId,
                    })),
                );
                console.log(
                    `Inserted ${OCCURRENCES.length} calendar occurrences for patient.`,
                );
            } else if (user.role === 'doctor' || user.role === 'support') {
                collaborators.push(insertionResponse.insertedId);
                console.log(`Added ${user.fullname} to collaborators list.`);
            }

            console.log(`Inserting credentials for user: ${user.email}`);
            await db.collection('credentials').insertOne({
                userId,
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
