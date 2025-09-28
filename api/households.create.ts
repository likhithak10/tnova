import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { ObjectId } from 'mongodb';
import { applyCors } from './_cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { name } = req.body || {};
  if (!name) return res.status(400).json({ ok: false, error: 'name required' });

  const db = await getDb();
  const now = new Date();
  const doc = { name, createdAt: now };
  const r = await db.collection('households').insertOne(doc);
  return res.status(200).json({ ok: true, householdId: r.insertedId });
}


