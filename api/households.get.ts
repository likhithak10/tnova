import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/mongo.js';
import { applyCors } from './_cors.js';
import { HOUSEHOLD_ID } from '../lib/constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const db = await getDb();
  const hh = await db.collection('households').findOne({ _id: HOUSEHOLD_ID });
  if (!hh) return res.status(200).json({ ok: true, household: null });
  return res.status(200).json({ ok: true, household: { _id: String(hh._id), name: hh.name ?? null } });
}


