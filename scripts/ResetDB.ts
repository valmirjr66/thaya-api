import axios from 'axios';
import * as dotenv from 'dotenv';
import { Db, MongoClient } from 'mongodb';
import askForConfirmation from './AskForConfirmation';
import {
    DEFAULT_1_DOCTOR_EMAIL,
    DEFAULT_1_PATIENT_EMAIL,
    DEFAULT_2_DOCTOR_EMAIL,
    DEFAULT_2_PATIENT_EMAIL,
    DEFAULT_ADMIN_EMAIL,
    DEFAULT_PASSWORD,
    DEFAULT_SUPPORT_EMAIL,
    DEFAULT_TELEGRAM_ID,
    DOCTOR_1_OCCURRENCES,
    DOCTOR_2_OCCURRENCES,
    PATIENT_RECORD,
    shiftOccurrenceDateBy_N_Months,
} from './Utils';

dotenv.config();

const IS_PROD = process.env.ENVIRONMENT === 'prod';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const API_URL = process.env.API_URL || 'http://localhost:4000/api';

function pickRandomItemFromArray<T>(array: T[]): T {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function generateRandomPhoneNumber(): string {
    const PHONE_NUMBER_LENGTH = 13;

    let result = '5531999';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; result.length <= PHONE_NUMBER_LENGTH; i++) {
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

async function insertOrganization(): Promise<string> {
    console.log('Inserting default organization');

    const { data: organizationInsertionData } = await axios.post(
        `${API_URL}/organizations`,
        {
            name: 'Thaya Health',
            collaborators: [],
            phoneNumber: '5531999999999',
            address: 'Belo Horizonte, MG, Brazil',
            timezoneOffset: -180,
        },
    );

    const organizationId = organizationInsertionData.id as string;

    console.log(`Inserted organization with id: ${organizationId}`);

    return organizationId;
}

async function insertAdminUser(db: Db): Promise<void> {
    console.log('Inserting admin user');

    const { insertedId } = await db.collection('adminusers').insertOne({
        fullname: 'Valmir Martins Júnior',
        email: DEFAULT_ADMIN_EMAIL,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    await db.collection('credentials').insertOne({
        userId: insertedId,
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_PASSWORD,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    console.log(`Inserted admin user with id: ${insertedId}`);
}

async function insertDoctorUser(
    organizationId: string,
    fullname: string,
    email: string,
): Promise<string> {
    console.log('Inserting doctor user with email:', email);

    const { data: doctorInsertionData } = await axios.post(
        `${API_URL}/doctor-users`,
        {
            fullname,
            email,
            phoneNumber: generateRandomPhoneNumber(),
            birthdate: generateRandomBirthdate(),
            password: DEFAULT_PASSWORD,
            organizationId: organizationId,
        },
    );

    console.log(`Inserted doctor user with id: ${doctorInsertionData.id}`);

    return doctorInsertionData.id as string;
}

async function insertSupportUser(
    organizationId: string,
    fullname: string,
    email: string,
): Promise<string> {
    console.log('Inserting support user with email:', email);

    const { data: supportInsertionData } = await axios.post(
        `${API_URL}/support-users`,
        {
            fullname,
            email,
            password: DEFAULT_PASSWORD,
            organizationId: organizationId,
        },
    );

    console.log(`Inserted support user with id: ${supportInsertionData.id}`);

    return supportInsertionData.id as string;
}

async function insertPatientUser(
    doctorsId: string[],
    fullname: string,
    email: string,
    nickname?: string,
): Promise<string> {
    console.log('Inserting default patient user with email:', email);

    const { data: patientInsertionData } = await axios.post(
        `${API_URL}/patient-users`,
        {
            doctorsId,
            fullname,
            email,
            nickname,
            phoneNumber: generateRandomPhoneNumber(),
            birthdate: generateRandomBirthdate(),
            password: DEFAULT_PASSWORD,
        },
    );

    console.log(`Inserted patient user with id: ${patientInsertionData.id}`);

    return patientInsertionData.id as string;
}

async function insertCalendarOccurrence(
    userId: string,
    patientId: string,
    datetime: string,
    description: string,
): Promise<void> {
    console.log(
        `Inserting calendar occurrence for user ${userId} and patient ${patientId}`,
    );

    await axios.post(`${API_URL}/calendar/occurrences`, {
        userId,
        patientId,
        datetime,
        description,
    });

    console.log(`Inserted calendar occurrence`);
}

async function insertPatientRecord(
    doctorId: string,
    patientId: string,
    summary: string,
    content: string,
    series: {
        title: string;
        type: string;
        records: { datetime: string; value: number }[];
    }[],
): Promise<void> {
    console.log(
        `Inserting patient record for doctor ${doctorId} and patient ${patientId}`,
    );

    await axios.post(`${API_URL}/patient-records`, {
        doctorId,
        patientId,
        summary,
        content,
        series,
    });

    console.log(`Inserted patient record`);
}

async function resetMongoDB() {
    if (IS_PROD) {
        await askForConfirmation(
            'You are about to reset DB in PRODUCTION environment. Do you want to proceed?',
        );
    }

    console.log(`Connecting to MongoDB at: ${DATABASE_URL}`);

    const client = new MongoClient(DATABASE_URL);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();
        const collections = await db.collections();

        console.log(
            `Found ${collections.length} collections. Clearing all collections`,
        );

        for (const collection of collections) {
            console.log(`Clearing collection: ${collection.collectionName}`);
            const result = await collection.deleteMany({});
            console.log(
                `Cleared ${collection.collectionName}: ${result.deletedCount} documents removed.`,
            );
        }

        console.log('Waiting for 10 seconds before proceeding...');
        await new Promise((resolve) => setTimeout(resolve, 10000));

        await insertAdminUser(db);

        const organizationId = await insertOrganization();

        console.log('Inserting doctors');

        const doctorId1 = await insertDoctorUser(
            organizationId,
            'Alessandra Matos Vieira',
            DEFAULT_1_DOCTOR_EMAIL,
        );

        const doctorId2 = await insertDoctorUser(
            organizationId,
            'Anderson Paiva Rocha',
            DEFAULT_2_DOCTOR_EMAIL,
        );

        console.log('Inserting patients');

        const patientId1 = await insertPatientUser(
            [doctorId1],
            'Rodrigo Medeiros Chaia',
            DEFAULT_1_PATIENT_EMAIL,
            'Rô',
        );

        const patientId2 = await insertPatientUser(
            [doctorId1, doctorId2],
            'Alex Silva Gomes',
            DEFAULT_2_PATIENT_EMAIL,
        );

        await db.collection('patientusers').updateMany(
            {},
            {
                $set: {
                    telegramChatId: DEFAULT_TELEGRAM_ID,
                    telegramUserId: DEFAULT_TELEGRAM_ID,
                },
            },
        );

        await insertSupportUser(
            organizationId,
            'Sofia Andrade Lima',
            DEFAULT_SUPPORT_EMAIL,
        );

        for (const occurrence of shiftOccurrenceDateBy_N_Months(
            DOCTOR_1_OCCURRENCES,
            0,
        )) {
            await insertCalendarOccurrence(
                doctorId1,
                patientId1,
                occurrence.datetime.toISOString(),
                occurrence.description,
            );
        }

        for (const occurrence of shiftOccurrenceDateBy_N_Months(
            DOCTOR_2_OCCURRENCES,
            0,
        )) {
            await insertCalendarOccurrence(
                doctorId2,
                pickRandomItemFromArray([patientId1, patientId2]),
                occurrence.datetime.toISOString(),
                occurrence.description,
            );
        }

        await insertPatientRecord(
            doctorId1,
            patientId1,
            PATIENT_RECORD.summary,
            PATIENT_RECORD.content,
            PATIENT_RECORD.series,
        );

        console.log('Database reset process completed successfully.');
    } catch (error) {
        console.error('Error clearing collections:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

resetMongoDB();
