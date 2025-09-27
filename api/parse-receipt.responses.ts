import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { applyCors } from './_cors.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY!, project: process.env.OPENAI_PROJECT });

function dataUrlToFile(dataUrl: string, fallbackName: string = 'image.jpg'): File | null {
  try {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) return null;
    const mime = match[1];
    const b64 = match[2];
    const bin = Buffer.from(b64, 'base64');
    const file = new File([bin], fallbackName, { type: mime as any });
    return file;
  } catch {
    return null;
  }
}

const receiptSchema = {
  name: 'receipt_extraction',
  schema: {
    type: 'object',
    properties: {
      purchaseDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            qty: { type: 'number' },
            unit: { type: 'string', enum: ['count', 'kg', 'g', 'lb', 'oz', 'l', 'ml', 'pack', 'other'] },
            price: { type: 'number' },
            category: { type: 'string', enum: ['produce', 'dairy', 'meat', 'seafood', 'bakery', 'pantry', 'frozen', 'beverage', 'prepared'] },
            estimatedShelfLifeDays: { type: 'number' },
            expiryDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            reasoning: { type: 'string' },
          },
          required: ['name', 'qty', 'unit', 'price', 'category', 'estimatedShelfLifeDays', 'expiryDate', 'reasoning'],
          additionalProperties: false,
        },
      },
      nonFoodIgnored: { type: 'array', items: { type: 'string' } },
      confidence: {
        type: 'object',
        properties: { purchaseDate: { type: 'number' }, items: { type: 'number' } },
        required: ['purchaseDate', 'items'],
        additionalProperties: false,
      },
    },
    required: ['purchaseDate', 'items', 'nonFoodIgnored', 'confidence'],
    additionalProperties: false,
  },
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { imageUrl, imageUrls } = req.body || {};
    const urls: string[] = Array.isArray(imageUrls)
      ? imageUrls.filter((u: any) => typeof u === 'string' && u)
      : (imageUrl ? [String(imageUrl)] : []);
    if (!urls.length) return res.status(400).json({ ok: false, error: 'imageUrls (array) or imageUrl (string) required' });

    const userContent: any[] = [{ type: 'text', text: 'Parse receipt image(s) and return JSON matching the provided schema.' }];

    for (let i = 0; i < urls.length; i++) {
      const u = urls[i];
      if (u.startsWith('data:')) {
        const file = dataUrlToFile(u, `receipt_${i + 1}.jpg`);
        if (!file) continue;
        const uploaded = await openai.files.create({ file, purpose: 'vision' });
        userContent.push({ type: 'image_file', image_file: { file_id: uploaded.id } });
      } else {
        userContent.push({ type: 'image_url', image_url: u });
      }
    }

    const body: any = {
      model: 'gpt-4.1-mini',
      temperature: 0,
      input: [
        {
          role: 'user',
          content: userContent as any,
        },
      ],
      response_format: { type: 'json_schema', json_schema: receiptSchema },
    };

    const response = await openai.responses.create(body);

    const text = (response as any).output_text || (response as any).output?.[0]?.content?.[0]?.text?.value || '{}';

    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: 'model did not return valid JSON', raw: text });
    }

    res.setHeader('x-openai-response-id', (response as any).id || '');
    return res.status(200).json(payload);
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
