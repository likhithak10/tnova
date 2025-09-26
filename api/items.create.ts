import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';
import type { ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { householdId, receipt, items } = req.body || {};
    if (!householdId || !Array.isArray(items)) {
      return res.status(400).json({ ok: false, error: 'householdId and items required' });
    }

    const db = await getDb();
    let receiptId: ObjectId | null = null;

    if (receipt) {
      const r = await db.collection('receipts').insertOne({ ...receipt, householdId, createdAt: new Date() });
      receiptId = r.insertedId;
    }

    const docs = items.map((it: any) => ({
      ...it,
      householdId,
      receiptId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await db.collection('items').insertMany(docs);
    return res.status(200).json({ ok: true, itemsCreated: result.insertedCount, receiptId });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
