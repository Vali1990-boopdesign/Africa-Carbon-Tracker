import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 1000
});

export function normalizeFilterKey(filters: any): string {
  const normalized = {
    country: Array.isArray(filters.country) ? [...filters.country].sort() : filters.country || [],
    buyerCountry: Array.isArray(filters.buyerCountry) ? [...filters.buyerCountry].sort() : filters.buyerCountry || [],
    sector: Array.isArray(filters.sector) ? [...filters.sector].sort() : filters.sector || [],
    projectType: Array.isArray(filters.projectType) ? [...filters.projectType].sort() : filters.projectType || [],
    scope: Array.isArray(filters.scope) ? [...filters.scope].sort() : filters.scope || [],
    startYear: filters.startYear || '',
    endYear: filters.endYear || '',
    search: filters.search || ''
  };
  
  return JSON.stringify(normalized);
}

export function getCachedResponse(key: string): any | undefined {
  return cache.get(key);
}

export function setCachedResponse(key: string, value: any, ttl?: number): void {
  cache.set(key, value, ttl);
}

export function clearCache(): void {
  cache.flushAll();
}

export function clearCacheByPattern(pattern: string): void {
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.del(key);
    }
  });
}

export { cache };
