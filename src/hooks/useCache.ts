
import { useState, useEffect } from 'react';

type CacheOptions = {
  expireTime?: number; // Time in milliseconds before cache expires
  storageType?: 'memory' | 'localStorage';
};

const DEFAULT_EXPIRE_TIME = 5 * 60 * 1000; // 5 minutes

export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    expireTime = DEFAULT_EXPIRE_TIME,
    storageType = 'memory',
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  // Memory cache store (module level)
  const memoryCache = useMemoryCache();

  // Check if cache is valid
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < expireTime;
  };

  // Get from cache
  const getFromCache = (): { data: T | null; timestamp: number | null } => {
    if (storageType === 'localStorage') {
      const cachedItem = localStorage.getItem(`cache_${key}`);
      if (cachedItem) {
        const { data, timestamp } = JSON.parse(cachedItem);
        if (isCacheValid(timestamp)) {
          return { data, timestamp };
        }
      }
    } else {
      const cachedItem = memoryCache.get(key);
      if (cachedItem && isCacheValid(cachedItem.timestamp)) {
        return cachedItem;
      }
    }
    
    return { data: null, timestamp: null };
  };

  // Save to cache
  const saveToCache = (data: T): void => {
    const timestamp = Date.now();
    
    if (storageType === 'localStorage') {
      localStorage.setItem(
        `cache_${key}`,
        JSON.stringify({ data, timestamp })
      );
    } else {
      memoryCache.set(key, { data, timestamp });
    }
    
    setLastFetched(timestamp);
  };

  // Fetch data
  const fetchData = async (force = false): Promise<void> => {
    // If not forced, check cache first
    if (!force) {
      const cachedResult = getFromCache();
      if (cachedResult.data) {
        setData(cachedResult.data);
        setLastFetched(cachedResult.timestamp);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      saveToCache(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // Invalidate cache
  const invalidateCache = (): void => {
    if (storageType === 'localStorage') {
      localStorage.removeItem(`cache_${key}`);
    } else {
      memoryCache.delete(key);
    }
    setLastFetched(null);
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [key]);

  return {
    data,
    isLoading,
    error,
    lastFetched,
    refetch: () => fetchData(true),
    invalidateCache,
  };
}

// Memory cache implementation (singleton)
const useMemoryCache = () => {
  const cache = globalThis.__MEMORY_CACHE__ || new Map();
  
  // Attach to global for persistence across renders
  if (!globalThis.__MEMORY_CACHE__) {
    globalThis.__MEMORY_CACHE__ = cache;
  }
  
  return {
    get: <T>(key: string) => cache.get(key) as { data: T; timestamp: number } | undefined,
    set: <T>(key: string, value: { data: T; timestamp: number }) => cache.set(key, value),
    delete: (key: string) => cache.delete(key),
    clear: () => cache.clear(),
  };
};

// Add type definition for global memory cache
declare global {
  var __MEMORY_CACHE__: Map<string, any> | undefined;
}

export default useCache;
