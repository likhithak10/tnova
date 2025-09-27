import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';
import { ObjectId } from 'mongodb';
import { HOUSEHOLD_ID } from '../lib/constants.js';
import { getUserIdFromRequest } from '../lib/auth.verify.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { receipt, items } = req.body || {};
    if (!Array.isArray(items)) {
      return res.status(400).json({ ok: false, error: 'items required' });
    }

    const db = await getDb();
    const userIdStr = await getUserIdFromRequest(req);
    if (!userIdStr) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    const CURRENT_USER_ID = new ObjectId(userIdStr);
    let receiptId: ObjectId | null = null;
    let receiptPurchaseDate: Date | null = null;

    if (receipt) {
      const { storeName, purchaseDate, total, imageUrl } = receipt || {};
      const createdAt = new Date();
      receiptPurchaseDate = purchaseDate ? new Date(purchaseDate) : null;
      const receiptDoc = {
        userId: CURRENT_USER_ID,
        householdId: HOUSEHOLD_ID,
        storeName: storeName ?? null,
        purchaseDate: receiptPurchaseDate ?? createdAt,
        total: total ?? null,
        imageUrl: imageUrl ?? null,
        createdAt,
      };
      const r = await db.collection('receipts').insertOne(receiptDoc);
      receiptId = r.insertedId;
    }

    // Build a product lookup by displayName (case-insensitive exact match)
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const names = Array.from(new Set(items.map((i: any) => (i.displayName || i.name || '').trim()).filter(Boolean)));
    const nameToProduct = new Map<string, any>();
    await Promise.all(names.map(async (n) => {
      const prod = await db.collection('products').findOne({ displayName: { $regex: `^${escapeRegex(n)}$`, $options: 'i' } });
      if (prod) nameToProduct.set(n.toLowerCase(), prod);
    }));

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const docs = items.map((raw: any) => {
      const displayName = (raw.displayName || raw.name || '').trim();
      const basePurchaseDate: Date = raw.purchaseDate ? new Date(raw.purchaseDate) : (receiptPurchaseDate ?? now);
      const matched = displayName ? nameToProduct.get(displayName.toLowerCase()) : null;
      const shelf = matched?.defaultShelfLifeDays;
      const explicitExpiry = raw.expiryDate ? new Date(raw.expiryDate) : null;
      // Per spec: use product default shelf life; otherwise fallback +3 days
      const computedExpiry = typeof shelf === 'number' ? new Date(basePurchaseDate.getTime() + shelf * dayMs) : new Date(basePurchaseDate.getTime() + 3 * dayMs);
      const expiryDate: Date | null = explicitExpiry || computedExpiry;

      return {
        ...raw,
        householdId: HOUSEHOLD_ID,
        ownerId: CURRENT_USER_ID,
        displayName,
        purchaseDate: basePurchaseDate,
        expiryDate,
        receiptId,
        storeName: (receipt && receipt.storeName) ? receipt.storeName : (raw.storeName || null),
        createdAt: now,
        updatedAt: now,
      };
    });

    const result = await db.collection('items').insertMany(docs);
    const itemIds = Object.values(result.insertedIds);
    return res.status(200).json({ ok: true, itemsCreated: result.insertedCount, receiptId, itemIds });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
