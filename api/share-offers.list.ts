import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';
import { HOUSEHOLD_ID } from '../lib/constants.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const db = await getDb();
  const offers = await db.collection('share_offers')
    .find({ householdId: HOUSEHOLD_ID, claimedBy: null })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  // Join minimal item info
  const toObjectId = (id: any): ObjectId | null => {
    try {
      const s = String(id);
      if (/^[a-f\d]{24}$/i.test(s)) return new ObjectId(s);
      return null;
    } catch { return null; }
  };
  const itemObjectIds = offers
    .map((o: any) => toObjectId(o.itemId))
    .filter((x): x is ObjectId => !!x);
  const items = await db.collection('items')
    .find({ _id: { $in: itemObjectIds } })
    .project({ displayName: 1, expiryDate: 1, ownerId: 1 })
    .toArray();
  const itemMap = new Map<string, any>(items.map((it: any) => [String(it._id), it]));

  // Join minimal user info
  const ownerIds = items.map((it:any)=> it?.ownerId).filter(Boolean);
  const usersColl = db.collection('users');
  const users = ownerIds.length ? await usersColl.find({ _id: { $in: ownerIds } }).project({ email: 1, name: 1 }).toArray() : [];
  const userMap = new Map<string, any>(users.map((u:any)=> [String(u._id), u]));

  const results = offers.map((o: any) => {
    const item = itemMap.get(String(o.itemId));
    const owner = item?.ownerId ? userMap.get(String(item.ownerId)) : null;
    return {
      _id: String(o._id),
      itemId: String(o.itemId),
      qtyOffered: o.qtyOffered ?? 1,
      createdAt: o.createdAt ?? null,
      expiresAt: o.expiresAt ?? null,
      claimedBy: o.claimedBy ? String(o.claimedBy) : null,
      item: item ? { _id: String(item._id), displayName: item.displayName, expiryDate: item.expiryDate ?? null, ownerId: item.ownerId ? String(item.ownerId) : null } : null,
      owner: owner ? { _id: String(owner._id), name: owner.name || null, email: owner.email || null } : null,
    };
  });

  return res.status(200).json({ ok: true, offers: results });
}


