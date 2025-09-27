import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { householdId, itemId, qtyOffered, expiresAt } = req.body || {};
  if (!householdId || !itemId || qtyOffered == null) {
    return res.status(400).json({ ok: false, error: 'householdId, itemId, qtyOffered required' });
  }

  const db = await getDb();
  const offerDoc = {
    householdId, itemId, qtyOffered,
    createdAt: new Date(),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    claimedBy: null
  } as any;
  const r = await db.collection('share_offers').insertOne(offerDoc);

  // Write a general notification for the household
  await db.collection('notifications').insertOne({
    householdId,
    userId: null,
    type: 'share_offer',
    payload: { offerId: r.insertedId, itemId, qtyOffered },
    createdAt: new Date(),
    seen: false,
  });

  return res.status(200).json({ ok: true, offerId: r.insertedId });
}
