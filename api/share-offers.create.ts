import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';
import { HOUSEHOLD_ID } from '../lib/constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { itemId, qtyOffered, expiresAt } = req.body || {};
  if (!itemId || qtyOffered == null) {
    return res.status(400).json({ ok: false, error: 'itemId, qtyOffered required' });
  }

  const db = await getDb();
  const offerDoc = {
    householdId: HOUSEHOLD_ID, itemId, qtyOffered,
    createdAt: new Date(),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    claimedBy: null
  } as any;
  const r = await db.collection('share_offers').insertOne(offerDoc);

  return res.status(200).json({ ok: true, offerId: r.insertedId });
}
