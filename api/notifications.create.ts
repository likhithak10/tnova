import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { userId = '68d78e0e2ca517490573a721', type, payload } = req.body || {};
  if (!type) {
    return res.status(400).json({ ok: false, error: 'type required' });
  }

  const db = await getDb();
  const doc = {
    userId: userId ?? '68d78e0e2ca517490573a721',
    type,
    payload: payload ?? {},
    createdAt: new Date(),
    seen: false,
  };
  const r = await db.collection('notifications').insertOne(doc);
  return res.status(200).json({ ok: true, notificationId: r.insertedId });
}


