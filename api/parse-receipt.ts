import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { applyCors } from './_cors.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY! });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { imageUrl } = req.body || {};
    if (!imageUrl) return res.status(400).json({ ok: false, error: 'imageUrl required' });

    const system = `Extract grocery receipt data. Return STRICT JSON:
{
  "storeName": string,
  "purchaseDate": "YYYY-MM-DD",
  "lineItems": [ { "name": string, "qty": number, "unit": string|null, "price": number|null } ]
}
Use the price column; infer qty (default 1); ignore loyalty messages and totals. Return JSON only.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: "Parse this receipt image and return only the JSON." },
            { type: "image_url", image_url: { url: imageUrl } }
          ] as any
        }
      ]
    });

    const text = completion.choices[0]?.message?.content || "{}";
    return res.status(200).send(text);
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
