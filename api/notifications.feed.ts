import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { userId = '68d78e0e2ca517490573a721' } = req.query as { userId?: string };

  const db = await getDb();
  const filter: any = { userId };

  const results = await db.collection('notifications')
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return res.status(200).json({ ok: true, notifications: results });
}


