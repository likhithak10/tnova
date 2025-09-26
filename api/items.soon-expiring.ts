import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { householdId, days = '3' } = req.query as { householdId?: string; days?: string };
  if (!householdId) return res.status(400).json({ ok: false, error: 'householdId required' });

  const db = await getDb();
  const now = new Date();
  const to = new Date(now);
  to.setDate(now.getDate() + Number(days));

  const items = await db.collection('items')
    .find({ householdId, expiryDate: { $gte: now, $lte: to } })
    .sort({ expiryDate: 1 })
    .limit(50)
    .toArray();

  return res.status(200).json({ ok: true, items });
}
