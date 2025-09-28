import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { applyCors } from './_cors.js';
import { withTrace } from '@openai/agents';

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

    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    if (!assistantId) {
      return res.status(500).json({ ok: false, error: 'OPENAI_ASSISTANT_ID not configured' });
    }

    const result = await withTrace('parse-receipt', async () => {
      const thread = await openai.beta.threads.create();

      const content: any[] = [];
      content.push({ type: 'text', text: 'Parse the receipt image(s) and reply with the JSON per your schema.' });

      for (let i = 0; i < urls.length; i++) {
        const u = urls[i];
        if (u.startsWith('data:')) {
          const file = dataUrlToFile(u, `receipt_${i + 1}.jpg`);
          if (!file) continue;
          const uploaded = await openai.files.create({ file, purpose: 'assistants' });
          content.push({ type: 'image_file', image_file: { file_id: uploaded.id } });
        } else {
          content.push({ type: 'image_url', image_url: u });
        }
      }

      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: content as any,
      });

      const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistantId,
      });

      return { threadId: thread.id, run };
    });

    const { threadId, run } = result as any;

    console.log('[parse-receipt] run', { id: run.id, status: run.status, threadId });

    if (run.status !== 'completed') {
      res.setHeader('x-openai-run-id', run.id);
      res.setHeader('x-openai-thread-id', threadId);
      return res.status(500).json({ ok: false, error: `assistant run status: ${run.status}` });
    }

    const messages: any = await openai.beta.threads.messages.list(threadId, { order: 'desc', limit: 1 });
    const latest: any = messages?.data?.[0];
    let out = '';
    if (latest && Array.isArray(latest.content)) {
      for (const block of latest.content) {
        if (block?.type === 'output_text' && block?.text?.value) { out = block.text.value; break; }
        if (block?.type === 'text' && block?.text?.value) { out = block.text.value; break; }
        if (typeof block?.text === 'string') { out = block.text; break; }
      }
    }
    if (!out) out = '{}';

    let payload: any;
    try {
      payload = JSON.parse(out);
    } catch (err: any) {
      res.setHeader('x-openai-run-id', run.id);
      res.setHeader('x-openai-thread-id', threadId);
      return res.status(500).json({ ok: false, error: 'assistant did not return valid JSON', raw: out });
    }

    res.setHeader('x-openai-run-id', run.id);
    res.setHeader('x-openai-thread-id', threadId);
    return res.status(200).json(payload);
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
