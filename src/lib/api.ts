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

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
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

  createNotification: (userId: string | null, type: string, payload: any) =>
    http<{ ok: boolean; notificationId: string }>(
      '/api/notifications.create',
      { method: 'POST', body: JSON.stringify({ userId, type, payload }) }
    ),

  notificationsFeed: () =>
    http<{ ok: boolean; notifications: any[] }>(`/api/notifications.feed`),

  householdsCreate: (name: string) =>
    http<{ ok: boolean; householdId: string }>(
      '/api/households.create',
      { method: 'POST', body: JSON.stringify({ name }) }
    ),

  // Join removed with auth

  // Mine removed with auth
};

export function getStoredUser(): null { return null; }
export function setStoredUser(_: any): void { /* no-op */ }

