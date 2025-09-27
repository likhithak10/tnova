import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';
import { CURRENT_USER_ID, HOUSEHOLD_ID } from '../lib/constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { userId } = req.query as { userId?: string };

  const db = await getDb();
  const filter: any = {
    householdId: HOUSEHOLD_ID,
    userId: { $in: [CURRENT_USER_ID, null] },
  };

  const results = await db.collection('notifications')
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return res.status(200).json({ ok: true, notifications: results });
}


