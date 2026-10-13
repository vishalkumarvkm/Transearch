import { MongoClient, Db, Collection } from 'mongodb';
import crypto from 'crypto';
import { CallInteraction } from './types/interaction';

const defaultUris = [
  process.env.MONGODB_URI,
  'mongodb://localhost:27018',
  'mongodb://localhost:27017',
].filter(Boolean) as string[];

const dbName = process.env.MONGODB_DB_NAME || 'transearch_voice_db';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connect to MongoDB and cache the connection for Next.js API routes
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  let lastError: unknown = null;

  for (const uri of Array.from(new Set(defaultUris))) {
    try {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 3000,
      });

      await client.connect();
      const db = client.db(dbName);

      // Initialize indexes matching Python backend
      try {
        const col = db.collection('interactions');
        await col.createIndex({ id: 1 }, { unique: true });
        await col.createIndex({ sessionId: 1 });
        await col.createIndex({ startedAt: -1 });
        await col.createIndex({ agentId: 1 });
        await col.createIndex({ status: 1 });
      } catch {
        // Indexes already configured
      }

      cachedClient = client;
      cachedDb = db;
      return { client, db };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Could not connect to MongoDB on any configured URI');
}

/**
 * Retrieve the typed interactions MongoDB collection
 */
export async function getInteractionsCollection(): Promise<Collection<CallInteraction> | null> {
  try {
    const { db } = await connectToDatabase();
    return db.collection<CallInteraction>('interactions');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[MongoDB] Database connection unavailable: ${message}`);
    return null;
  }
}

/**
 * Verify username & password against MongoDB users collection (salted SHA-256)
 */
export async function verifyUserInDatabase(
  username: string,
  password: string
): Promise<{ id?: string; username: string; email?: string; role: string } | null> {
  try {
    const { db } = await connectToDatabase();
    const usersCol = db.collection('users');
    const normUser = username.trim().toLowerCase();

    const userDoc = await usersCol.findOne({
      $or: [
        { username: normUser },
        { email: normUser }
      ]
    });

    if (userDoc && userDoc.passwordHash && userDoc.salt) {
      const expected = crypto
        .createHash('sha256')
        .update(password + userDoc.salt)
        .digest('hex');

      if (crypto.timingSafeEqual(Buffer.from(userDoc.passwordHash), Buffer.from(expected))) {
        return {
          id: userDoc.id,
          username: userDoc.username,
          email: userDoc.email,
          role: userDoc.role || 'consultant',
        };
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[MongoDB Auth] User verification error: ${message}`);
  }

  return null;
}
