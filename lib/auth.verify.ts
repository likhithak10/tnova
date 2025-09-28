import { createRemoteJWKSet, jwtVerify } from 'jose';

const APP_ID = process.env.MONGODB_APP_ID as string;

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function getUserIdFromRequest(req: any): Promise<string | null> {
  try {
    if (!APP_ID) return null;
    const header = req.headers?.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      console.log('[auth.verify] missing bearer token');
      return null;
    }

    // Try simple online verification via App Services profile endpoint (works for HS256 tokens)
    const payloadPreview = decodeJwtPayload(token) || {};
    const issuerBase: string = typeof payloadPreview.iss === 'string' && payloadPreview.iss.startsWith('http')
      ? payloadPreview.iss
      : (process.env.MONGODB_APP_BASE || 'https://services.cloud.mongodb.com');

    const profileUrl = new URL(`/api/client/v2.0/app/${APP_ID}/auth/profile`, issuerBase).toString();
    try {
      const r = await fetch(profileUrl, { headers: { Authorization: `Bearer ${token}` } });
      console.log('[auth.verify] profile fetch', profileUrl, r.status);
      if (r.ok) {
        const j: any = await r.json().catch(() => ({}));
        if (j && (j.user_id || j.userId || j.sub)) return String(j.user_id || j.userId || j.sub);
      }
    } catch {}

    // Fallback to RS256 verification (some environments use RS256)
    try {
      const jwksUrl = new URL(`/api/client/v2.0/app/${APP_ID}/auth/.well-known/jwks.json`, issuerBase);
      const JWKS = createRemoteJWKSet(jwksUrl);
      const { payload } = await jwtVerify(token, JWKS, { algorithms: ['RS256'] });
      return String(payload.sub || '');
    } catch {}

    // Last-resort DEV fallback: decode JWT locally and trust sub if it looks like a Mongo ObjectId
    const decoded = decodeJwtPayload(token);
    if (decoded && typeof decoded.sub === 'string' && /^[0-9a-fA-F]{24}$/.test(decoded.sub)) {
      console.warn('[auth.verify] using DEV fallback (decoded sub)');
      return decoded.sub;
    }

    return null;
  } catch {
    return null;
  }
}


