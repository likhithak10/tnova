export type LineItem = { name: string; qty: number; unit: string | null; price: number | null };
export type ParsedReceipt = { storeName: string; purchaseDate: string; lineItems: LineItem[] };
// V2 schema for model output (receipt extraction only)
export type ParsedReceiptV2 = {
  purchaseDate: string; // YYYY-MM-DD
  items: Array<{
    name: string;
    qty: number;
    unit: 'count'|'kg'|'g'|'lb'|'oz'|'l'|'ml'|'pack'|'other';
    price: number;
    category: 'produce'|'dairy'|'meat'|'seafood'|'bakery'|'pantry'|'frozen'|'beverage'|'prepared';
    estimatedShelfLifeDays: number;
    expiryDate: string; // YYYY-MM-DD
    reasoning: string;
  }>;
  nonFoodIgnored: string[];
  confidence: { purchaseDate: number; items: number };
};
export type User = { _id: string; email: string; name?: string | null };

export type ItemDoc = {
  _id?: string;
  ownerId?: string | null;
  productId?: string | null;
  displayName: string;
  qty?: number;
  unit?: string;
  purchaseDate: string | Date;
  expiryDate?: string | Date | null;
  storage?: 'pantry' | 'fridge' | 'freezer' | string;
  price?: number | null;
  storeName?: string | null;
  receiptId?: string | null;
};

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';

function asHeaderObject(h?: HeadersInit): Record<string,string> {
  if (!h) return {};
  if (h instanceof Headers) {
    const out: Record<string,string> = {};
    h.forEach((v,k)=>{ out[k]=v; });
    return out;
  }
  if (Array.isArray(h as any)) {
    const out: Record<string,string> = {};
    for (const [k,v] of (h as any)) out[String(k)] = String(v);
    return out;
  }
  return { ...(h as any) };
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  // Read token from a global hook set by src/lib/auth.ts to avoid a direct import
  const token: string | null = (globalThis as any)?.__getAccessToken?.() ?? null;
  const baseHeaders = asHeaderObject(init?.headers);
  const headers: any = { 'Content-Type': 'application/json', ...baseHeaders };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...(init || {}), headers });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data && data.error) message = String(data.error);
    } catch {}
    throw new Error(message);
  }
  return await res.json();
}

export const Api = {
  // Authentication removed

  parseReceipt: (imageUrls: string[]) =>
    http<ParsedReceiptV2>('/api/parse-receipt', { method: 'POST', body: JSON.stringify({ imageUrls }) }),

  createItems: (receipt: any | null, items: Partial<ItemDoc>[]) =>
    http<{ ok: boolean; itemsCreated: number; receiptId?: string; itemIds?: string[] }>(
      '/api/items.create',
      { method: 'POST', body: JSON.stringify({ receipt, items }) }
    ),

  saveReceipt: (parsed: ParsedReceiptV2, images: string[] = []) =>
    http<{ ok: boolean; itemsCreated: number; receiptId?: string; itemIds?: string[] }>(
      '/api/receipts.save',
      { method: 'POST', body: JSON.stringify({ parsed, images }) }
    ),

  itemsSoonExpiring: (days = 3) =>
    http<{ ok: boolean; items: ItemDoc[] }>(`/api/items.soon-expiring?days=${days}`),

  itemsList: (q = '', storage?: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (storage) params.set('storage', storage);
    return http<{ ok: boolean; items: ItemDoc[] }>(`/api/items.list?${params.toString()}`);
  },

  productsSearch: (q: string) => http<{ ok: boolean; results: { displayName: string }[] }>(`/api/products.search?q=${encodeURIComponent(q)}`),

  createOffer: (itemId: string, qtyOffered: number, expiresAt?: string) =>
    http<{ ok: boolean; offerId: string }>(
      '/api/share-offers.create',
      { method: 'POST', body: JSON.stringify({ itemId, qtyOffered, expiresAt }) }
    ),

  claimOffer: (offerId: string) =>
    http<{ ok: boolean; claimed: boolean; reason?: string }>(
      '/api/share-offers.claim',
      { method: 'POST', body: JSON.stringify({ offerId }) }
    ),

  listOffers: () =>
    http<{ ok: boolean; offers: Array<{ _id: string; itemId: string; qtyOffered: number; claimedBy: string | null; item: { _id: string; displayName: string; expiryDate?: string | null; ownerId?: string | null } | null }> }>(
      '/api/share-offers.list'
    ),

  createNotification: (userId: string | null, type: string, payload: any) =>
    http<{ ok: boolean; notificationId: string }>(
      '/api/notifications.create',
      { method: 'POST', body: JSON.stringify({ userId, type, payload }) }
    ),

  notificationsFeed: () =>
    http<{ ok: boolean; notifications: any[] }>(`/api/notifications.feed`),

  markNotificationsSeen: (ids: string[]) =>
    http<{ ok: boolean; updated: number }>(
      '/api/notifications.mark-seen',
      { method: 'POST', body: JSON.stringify({ ids }) }
    ),

  householdsCreate: (name: string) =>
    http<{ ok: boolean; householdId: string }>(
      '/api/households.create',
      { method: 'POST', body: JSON.stringify({ name }) }
    ),

  householdGet: () =>
    http<{ ok: boolean; household: { _id: string; name: string | null } | null }>(
      '/api/households.get'
    ),

  // Join removed with auth

  // Mine removed with auth
};

export function getStoredUser(): null { return null; }
export function setStoredUser(_: any): void { /* no-op */ }

