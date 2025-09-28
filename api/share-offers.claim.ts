import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { ObjectId } from 'mongodb';
import { applyCors } from './_cors.js';
import { getUserIdFromRequest } from '../lib/auth.verify.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { offerId } = req.body || {};
  if (!offerId) return res.status(400).json({ ok: false, error: 'offerId required' });

  const db = await getDb();
  const userIdStr = await getUserIdFromRequest(req);
  if (!userIdStr) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const CURRENT_USER_ID = new ObjectId(userIdStr);
  const r = await db.collection('share_offers').updateOne(
    { _id: new ObjectId(offerId), claimedBy: null },
    { $set: { claimedBy: CURRENT_USER_ID } }
  );

  if (r.matchedCount === 0) {
    return res.status(200).json({ ok: true, claimed: false, reason: 'already-claimed-or-missing' });
  }
  try {
    const offer = await db.collection('share_offers').findOne({ _id: new ObjectId(offerId) });
    if (offer?.itemId) {
      await db.collection('items').updateOne(
        { _id: offer.itemId },
        { $set: { offered: false, ownerId: CURRENT_USER_ID } }
      );
    }
  } catch {}
  return res.status(200).json({ ok: true, claimed: true });
}
