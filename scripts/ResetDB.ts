import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { DEFAULT_USER_EMAIL, OCCURRENCES } from './Utils';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function resetMongoDB() {
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

        await db.collection('credentials').insertOne({
            email: DEFAULT_USER_EMAIL,
            password: '123',
        });

        await db.collection('users').insertOne({
            fullname: 'Valmir G. Martins Júnior',
            email: DEFAULT_USER_EMAIL,
            phoneNumber: '5537998014263',
            birthdate: '2000-04-13',
            nickname: 'Val',
            profilePicFileName: 'sample1.jpg',
            telegramUserId: 761249989,
            telegramChatId: 761249989,
        });

        // Enhanced: Multiple calendar events per day at different hours
        await db.collection('calendars').insertMany(OCCURRENCES);

        console.log('All collections cleared successfully.');
    } catch (error) {
        console.error('Error clearing collections:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

resetMongoDB();
