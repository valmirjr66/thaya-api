import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { User } from 'src/modules/user/schemas/UserSchema';
import { UserRole } from 'src/types/user';
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
    for (let i = 0; i < characters.length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}

function generateRandomBirthdate(): string {
    const start = new Date(1960, 0, 1);
    const end = new Date(2005, 0, 1);
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

    const client = new MongoClient(DATABASE_URL);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();
        const collections = await db.collections();

        for (const collection of collections) {
            const result = await collection.deleteMany({});

            console.log(
                `Cleared ${collection.collectionName}: ${result.deletedCount} documents removed.`,
            );
        }

        const accountsToBeCreated: {
            name: string;
            email: string;
            role: UserRole;
        }[] = [
            {
                name: 'Valmir Martins Júnior',
                email: DEFAULT_ADMIN_EMAIL,
                role: 'admin',
            },
            {
                name: 'Alessandra Matos Vieira',
                email: DEFAULT_1_DOCTOR_EMAIL,
                role: 'doctor',
            },
            {
                name: 'André Luiz Silva',
                email: DEFAULT_2_DOCTOR_EMAIL,
                role: 'doctor',
            },
            {
                name: 'Juliana Andrade Santos',
                email: DEFAULT_SUPPORT_EMAIL,
                role: 'support',
            },
            {
                name: 'Rodrigo Medeiros Chaia',
                email: DEFAULT_PATIENT_EMAIL,
                role: 'patient',
            },
        ];

        let patientUserId: string;

        for (const account of accountsToBeCreated) {
            await db.collection('credentials').insertOne({
                email: account.email,
                password: '123',
            });

            const userToBeCreated: Omit<
                User,
                '_id' | 'createdAt' | 'updatedAt'
            > = {
                fullname: account.name,
                role: account.role,
                email: account.email,
                phoneNumber: `5531999${generateRandomSequenceOfDigits(6)}`,
                birthdate: generateRandomBirthdate(),
                profilePicFileName: 'sample1.jpg',
            };

            if (account.role === 'patient') {
                userToBeCreated.telegramChatId = 761249989;
                userToBeCreated.telegramUserId = 761249989;
            }

            const insertionResponse = await db
                .collection('users')
                .insertOne(userToBeCreated);

            if (account.role === 'patient') {
                patientUserId = insertionResponse.insertedId.toString();
            }
        }

        await db.collection('calendars').insertMany(
            OCCURRENCES.map((occurrence) => ({
                ...occurrence,
                userId: patientUserId,
            })),
        );

        console.log('All collections cleared successfully.');
    } catch (error) {
        console.error('Error clearing collections:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

resetMongoDB();
