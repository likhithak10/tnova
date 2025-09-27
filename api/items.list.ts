import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';
import { HOUSEHOLD_ID } from '../lib/constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { q = '', storage, limit = '50' } = req.query as {
    q?: string;
    storage?: string;
    limit?: string;
  };

  const db = await getDb();
  const filter: any = { householdId: HOUSEHOLD_ID };
  const trimmed = (q || '').trim();
  if (trimmed) {
    filter.displayName = { $regex: trimmed, $options: 'i' };
  }
  if (storage) {
    filter.storage = storage;
  }

  const num = Math.max(1, Math.min(200, Number(limit) || 50));
  const items = await db.collection('items')
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(num)
    .toArray();

  return res.status(200).json({ ok: true, items });
}


