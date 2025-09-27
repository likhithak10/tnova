import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';

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
    const now = new Date();

    const receiptDoc: any = {
      purchaseDate: new Date(parsed.purchaseDate),
      images,
      nonFoodIgnored: parsed.nonFoodIgnored ?? [],
      confidence: parsed.confidence ?? null,
      raw: parsed,
      createdAt: now,
    };
    const r = await db.collection('receipts').insertOne(receiptDoc);

    const items = (parsed.items as any[]).map((li) => {
      const purchaseDate = parsed.purchaseDate ? new Date(parsed.purchaseDate) : now;
      const expiryDate = li.expiryDate ? new Date(li.expiryDate) : null;
      return {
        displayName: String(li.name || '').trim(),
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
