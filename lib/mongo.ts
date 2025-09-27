import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.DB_NAME || 'cookenova';

let client: MongoClient | null = null;
let indexesEnsured = false;

async function ensureIndexes(db: any) {
  // users: unique email
  await db.collection('users').createIndexes([
    { key: { email: 1 }, name: 'users_unique_email', unique: true },
  ]);

  // items: index by expiryDate to support soon-expiring queries
  await db.collection('items').createIndexes([
    { key: { expiryDate: 1 }, name: 'items_expiryDate' },
    { key: { updatedAt: -1 }, name: 'items_updatedAt_desc' },
  ]);

  // notifications: per-user feed index + TTL 30d
  await db.collection('notifications').createIndexes([
    { key: { userId: 1, createdAt: -1 }, name: 'notifications_user_createdAt' },
    { key: { createdAt: 1 }, name: 'notifications_ttl_createdAt', expireAfterSeconds: 2592000 },
  ]);
}

export async function getDb() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  const db = client.db(dbName);
  if (!indexesEnsured) {
    await ensureIndexes(db);
    indexesEnsured = true;
  }
  return db;
}
