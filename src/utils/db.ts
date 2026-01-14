import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/alifarm';
let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
    if (db) return db;

    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB');
    }

    db = client.db();
    return db;
}
