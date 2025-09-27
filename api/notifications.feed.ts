import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';
import { ObjectId } from 'mongodb';
import { HOUSEHOLD_ID } from '../lib/constants.js';
import { getUserIdFromRequest } from '../lib/auth.verify.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const db = await getDb();
  const userIdStr = await getUserIdFromRequest(req);
  if (!userIdStr) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const currentUserId = new ObjectId(userIdStr);
  const filter: any = { householdId: HOUSEHOLD_ID, userId: { $in: [currentUserId, null] } };

  const results = await db.collection('notifications')
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return res.status(200).json({ ok: true, notifications: results });
}


