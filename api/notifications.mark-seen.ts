import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';
import { ObjectId } from 'mongodb';
import { getUserIdFromRequest } from '../lib/auth.verify.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { ids = [] } = req.body || {};
  const userIdStr = await getUserIdFromRequest(req);
  if (!userIdStr) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const currentUserId = new ObjectId(userIdStr);

  const db = await getDb();
  const objectIds = Array.isArray(ids) ? ids.map((s: string) => new ObjectId(s)).filter(Boolean) : [];
  if (objectIds.length === 0) return res.status(200).json({ ok: true, updated: 0 });

  const r = await db.collection('notifications').updateMany(
    { _id: { $in: objectIds } },
    { $addToSet: { seenByUserIds: currentUserId } }
  );
  return res.status(200).json({ ok: true, updated: r.modifiedCount });
}


