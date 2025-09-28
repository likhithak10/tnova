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
    const { parsed, images = [] } = req.body || {};
    if (!parsed || !parsed.purchaseDate || !Array.isArray(parsed.items)) {
      return res.status(400).json({ ok: false, error: 'parsed with purchaseDate and items required' });
    }

    const db = await getDb();
    const userIdStr = await getUserIdFromRequest(req);
    if (!userIdStr) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    const CURRENT_USER_ID = new ObjectId(userIdStr);
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    const receiptDoc: any = {
      userId: CURRENT_USER_ID,
      householdId: HOUSEHOLD_ID,
      purchaseDate: new Date(parsed.purchaseDate),
      images,
      nonFoodIgnored: parsed.nonFoodIgnored ?? [],
      confidence: parsed.confidence ?? null,
      raw: parsed,
      createdAt: now,
    };
    const r = await db.collection('receipts').insertOne(receiptDoc);

    // Build a product lookup by displayName (case-insensitive exact match)
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const names = Array.from(new Set((parsed.items as any[]).map((i: any) => String(i.name || '').trim()).filter(Boolean)));
    const nameToProduct = new Map<string, any>();
    await Promise.all(names.map(async (n) => {
      const prod = await db.collection('products').findOne({ displayName: { $regex: `^${escapeRegex(n)}$`, $options: 'i' } });
      if (prod) nameToProduct.set(n.toLowerCase(), prod);
    }));

    const items = (parsed.items as any[]).map((li) => {
      const displayName = String(li.name || '').trim();
      const purchaseDate = parsed.purchaseDate ? new Date(parsed.purchaseDate) : now;
      const matched = displayName ? nameToProduct.get(displayName.toLowerCase()) : null;
      const shelf = matched?.defaultShelfLifeDays;
      const explicitExpiry = li.expiryDate ? new Date(li.expiryDate) : null;
      const computedExpiry = typeof shelf === 'number' ? new Date(purchaseDate.getTime() + shelf * dayMs) : new Date(purchaseDate.getTime() + 3 * dayMs);
      const expiryDate: Date | null = explicitExpiry || computedExpiry;
      return {
        householdId: HOUSEHOLD_ID,
        ownerId: CURRENT_USER_ID,
        productId: matched?._id || null,
        displayName,
        qty: Number(li.qty || 0),
        unit: li.unit || 'count',
        price: typeof li.price === 'number' ? li.price : null,
        category: li.category || null,
        estimatedShelfLifeDays: typeof li.estimatedShelfLifeDays === 'number' ? li.estimatedShelfLifeDays : null,
        reasoning: li.reasoning || null,
        purchaseDate,
        expiryDate,
        receiptId: r.insertedId,
        createdAt: now,
        updatedAt: now,
      };
    });

    const result = await db.collection('items').insertMany(items);
    const itemIds = Object.values(result.insertedIds);
    return res.status(200).json({ ok: true, itemsCreated: result.insertedCount, receiptId: r.insertedId, itemIds });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
