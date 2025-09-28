import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';
import { HOUSEHOLD_ID } from '../lib/constants.js';
import { getUserIdFromRequest } from '../lib/auth.verify.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { itemId, qtyOffered, expiresAt } = req.body || {};
  if (!itemId || qtyOffered == null) {
    return res.status(400).json({ ok: false, error: 'itemId, qtyOffered required' });
  }

  const db = await getDb();
  const userIdStr = await getUserIdFromRequest(req);
  const currentUserId = userIdStr ? new ObjectId(userIdStr) : null as any;
  let itemObjectId: any = null;
  try { itemObjectId = new ObjectId(String(itemId)); } catch {}
  const offerDoc = {
    householdId: HOUSEHOLD_ID, itemId: itemObjectId || itemId, qtyOffered,
    createdAt: new Date(),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    claimedBy: null
  } as any;
  const r = await db.collection('share_offers').insertOne(offerDoc);
  // Mark item as offered so it no longer appears in inventory list
  try { await db.collection('items').updateOne({ _id: new ObjectId(itemId) }, { $set: { offered: true } }); } catch {}

  // Create a notification for household, excluding the offer owner on client by ignoring own offers
  const item = await db.collection('items').findOne({ _id: new ObjectId(itemId) });
  await db.collection('notifications').insertOne({
    householdId: HOUSEHOLD_ID,
    userId: null, // broadcast to household; clients should filter out own offers
    type: 'offer_created',
    payload: { itemId, displayName: item?.displayName || null, ownerId: item?.ownerId ? String(item.ownerId) : null },
    createdAt: new Date(),
    seen: false,
  });

  return res.status(200).json({ ok: true, offerId: r.insertedId });
}
