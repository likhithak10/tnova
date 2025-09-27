import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';
import { CURRENT_USER_ID, HOUSEHOLD_ID } from '../lib/constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { type, payload, userId } = req.body || {};
  if (!type) {
    return res.status(400).json({ ok: false, error: 'type required' });
  }

  const db = await getDb();
  const doc = {
    householdId: HOUSEHOLD_ID,
    userId: userId ?? CURRENT_USER_ID,
    type,
    payload: payload ?? {},
    createdAt: new Date(),
    seen: false,
  };
  const r = await db.collection('notifications').insertOne(doc);
  return res.status(200).json({ ok: true, notificationId: r.insertedId });
}


