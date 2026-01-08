import { Db, MongoClient } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'OWNER' | 'STAFF' | 'INVESTOR';
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  investments?: any[];
}

export class UserModel {
  private static getDb(): Promise<Db> {
    return clientPromise.then((client) => {
      return client.db();
    });
  }

  static async create(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = await this.getDb();
    const now = new Date();
    const user = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection('users').insertOne(user);
    return { ...user, _id: result.insertedId.toString() } as User;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const db = await this.getDb();
    const user = await db.collection('users').findOne({ email });
    return user ? { ...user, _id: user._id.toString() } as User : null;
  }

  static async findById(id: string): Promise<User | null> {
    const db = await this.getDb();
    const user = await db.collection('users').findOne({ _id: id as any });
    return user ? { ...user, _id: user._id.toString() } as User : null;
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const db = await this.getDb();
    const result = await db.collection('users').findOneAndUpdate(
      { _id: id as any },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result ? { ...result, _id: result._id.toString() } as User : null;
  }

  static async delete(id: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.collection('users').deleteOne({ _id: id as any });
    return result.deletedCount === 1;
  }

  static async findAll(): Promise<User[]> {
    const db = await this.getDb();
    const users = await db.collection('users').find({}).toArray();
    return users.map((user) => ({ ...user, _id: user._id.toString() })) as User[];
  }
}
