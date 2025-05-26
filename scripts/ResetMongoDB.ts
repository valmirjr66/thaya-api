import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

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
            email: 'valmirgmj@gmail.com',
            password: 'a',
        });

        await db.collection('users').insertOne({
            fullname: 'Valmir G. Martins Júnior',
            email: 'valmirgmj@gmail.com',
            birthdate: '2000-04-13',
            nickname: 'Val',
        });

        console.log('All collections cleared successfully.');
    } catch (error) {
        console.error('Error clearing collections:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

resetMongoDB();
