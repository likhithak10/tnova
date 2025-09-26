import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const q = (req.query.q as string || '').trim();
  if (!q) return res.status(200).json({ ok: true, results: [] });

  const db = await getDb();
  // Quick regex for hackathon; you can swap to Atlas $search later
  const results = await db.collection('products')
    .find({ displayName: { $regex: q, $options: 'i' } })
    .limit(10)
    .project({ displayName: 1, category: 1 })
    .toArray();

  return res.status(200).json({ ok: true, results });
}
