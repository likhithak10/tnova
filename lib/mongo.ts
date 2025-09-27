import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'cookenova';

let client: MongoClient | null = null;
let indexesEnsured = false;

async function createIndexesIfMissing(db: any, collectionName: string, indexes: Array<{ name: string } & any>) {
  const existing = new Set<string>();
  try {
    const current = await db.collection(collectionName).listIndexes().toArray();
    for (const idx of current) existing.add(idx.name);
  } catch {
    // If collection does not exist yet, proceed to create
  }
  const toCreate = indexes.filter((i) => i?.name && !existing.has(i.name));
  if (toCreate.length === 0) return;
  try {
    await db.collection(collectionName).createIndexes(toCreate as any);
  } catch (err: any) {
    const msg = String(err?.message || '');
    // Ignore conflicts where the same index name already exists
    if (msg.includes('same name') || msg.includes('already exists') || err?.codeName === 'IndexOptionsConflict') {
      return;
    }
    throw err;
  }
}

async function ensureIndexes(db: any) {
  // users
  await createIndexesIfMissing(db, 'users', [
    { key: { householdId: 1 }, name: 'users_by_household' },
    { key: { email: 1 }, name: 'email_unique', unique: true },
  ]);

  // households (optional for later)
  await createIndexesIfMissing(db, 'households', [
    { key: { inviteCode: 1 }, name: 'invite_code_unique', unique: true, sparse: true },
  ]);

  // products
  await createIndexesIfMissing(db, 'products', [
    { key: { displayName: 1 }, name: 'products_name_idx' },
    { key: { upc: 1 }, name: 'upc_unique', unique: true, sparse: true },
  ]);

  // items
  await createIndexesIfMissing(db, 'items', [
    { key: { householdId: 1, expiryDate: 1 }, name: 'household_expiry_idx' },
    { key: { householdId: 1, createdAt: -1 }, name: 'household_recent_idx' },
  ]);

  // receipts
  await createIndexesIfMissing(db, 'receipts', [
    { key: { householdId: 1, purchaseDate: -1 }, name: 'household_receipts_idx' },
  ]);

  // share_offers
  await createIndexesIfMissing(db, 'share_offers', [
    { key: { householdId: 1, createdAt: -1 }, name: 'offers_feed_idx' },
    { key: { itemId: 1 }, name: 'offer_item_idx' },
    { key: { createdAt: 1 }, name: 'offer_2d_ttl', expireAfterSeconds: 172800 },
  ]);

  // notifications
  await createIndexesIfMissing(db, 'notifications', [
    { key: { householdId: 1, userId: 1, createdAt: -1 }, name: 'notif_user_feed_idx' },
    { key: { createdAt: 1 }, name: 'notif_30d_ttl', expireAfterSeconds: 2592000 },
  ]);
}

export async function getDb() {
  if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new Error('MONGODB_URI missing or invalid. Expected to start with mongodb:// or mongodb+srv://');
  }
  if (!client) {
    try {
      client = new MongoClient(uri);
      await client.connect();
    } catch (err: any) {
      throw new Error(`Failed to connect to MongoDB: ${err?.message || String(err)}`);
    }
  }
  const db = client.db(dbName);
  if (!indexesEnsured) {
    await ensureIndexes(db);
    indexesEnsured = true;
  }
  return db;
}
