const GSH_API_HOST = process.env.GSH_API_HOST || 'pot-api.gsh-servers.com';
const GSH_API_TOKEN = process.env.GSH_API_TOKEN || '';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) return null;
  return entry.data;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
}

function getStaleCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  return entry?.data ?? null;
}

export function clearModsCache(): void {
  cache.delete('mods');
}

async function gshFetch(path: string): Promise<unknown> {
  const url = `https://${GSH_API_HOST}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GSH_API_TOKEN}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`GSH API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface GshMod {
  mod_id: string;
  name: string;
  creator: string;
  description: string;
  image_url: string;
  sku: string;
}

interface GshApiMod {
  id: number;
  sku: string;
  name: string;
  description?: string;
  authorDisplayName?: string;
  imagesIcon?: string;
}

// Mods - 10 minute cache
export async function fetchMods(): Promise<GshMod[]> {
  const cached = getCached<GshMod[]>('mods');
  if (cached) return cached;

  try {
    const allMods: GshMod[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const data = (await gshFetch(`/api/v1/mods?offset=${offset}&limit=${limit}`)) as { items?: GshApiMod[]; total?: number };
      const items = data.items || [];
      for (const mod of items) {
        allMods.push({
          mod_id: mod.sku,
          name: mod.name,
          creator: mod.authorDisplayName || '',
          description: mod.description || '',
          image_url: mod.imagesIcon || '',
          sku: mod.sku,
        });
      }
      offset += limit;
      hasMore = items.length === limit;
    }

    setCache('mods', allMods, 10 * 60 * 1000);
    return allMods;
  } catch (err) {
    const stale = getStaleCached<GshMod[]>('mods');
    if (stale) return stale;
    throw err;
  }
}

// Servers - 2 minute cache
export async function fetchServers(): Promise<{ total: number; items: unknown[] }> {
  const cached = getCached<{ total: number; items: unknown[] }>('servers');
  if (cached) return cached;

  try {
    const allItems: unknown[] = [];
    let offset = 0;
    const limit = 100;
    let total = 0;
    let hasMore = true;

    while (hasMore) {
      const data = (await gshFetch(`/api/v1/servers?offset=${offset}&limit=${limit}`)) as { items?: unknown[]; total?: number };
      const items = data.items || [];
      total = data.total || 0;
      allItems.push(...items);
      offset += limit;
      hasMore = items.length === limit;
    }

    const result = { total, items: allItems };
    setCache('servers', result, 2 * 60 * 1000);
    return result;
  } catch (err) {
    const stale = getStaleCached<{ total: number; items: unknown[] }>('servers');
    if (stale) return stale;
    throw err;
  }
}

// Curve overrides - 30 minute cache
export async function fetchCurveOverrides(): Promise<unknown> {
  const cached = getCached<unknown>('curveOverrides');
  if (cached) return cached;

  try {
    const data = await gshFetch('/api/v1/co');
    setCache('curveOverrides', data, 30 * 60 * 1000);
    return data;
  } catch (err) {
    const stale = getStaleCached<unknown>('curveOverrides');
    if (stale) return stale;
    throw err;
  }
}

// Generic curve override proxy
export async function fetchCurveOverridesByPath(path: string): Promise<unknown> {
  const cacheKey = `co:${path}`;
  const cached = getCached<unknown>(cacheKey);
  if (cached) return cached;

  const data = await gshFetch(`/api/v1/co/${path}`);
  setCache(cacheKey, data, 30 * 60 * 1000);
  return data;
}
