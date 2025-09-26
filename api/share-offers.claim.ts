import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo';
import { ObjectId } from 'mongodb';
import { applyCors } from './_cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { offerId, userId } = req.body || {};
  if (!offerId || !userId) return res.status(400).json({ ok: false, error: 'offerId and userId required' });

  const db = await getDb();
  const r = await db.collection('share_offers').updateOne(
    { _id: new ObjectId(offerId), claimedBy: null },
    { $set: { claimedBy: userId } }
  );

  if (r.matchedCount === 0) {
    return res.status(200).json({ ok: true, claimed: false, reason: 'already-claimed-or-missing' });
  }
  return res.status(200).json({ ok: true, claimed: true });
}
