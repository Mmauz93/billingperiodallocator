/**
 * Calculation Cache Service
 * 
 * This module provides caching for expensive calculation operations.
 * It includes:
 * - In-memory LRU cache for calculation results
 * - Persistent cache using localStorage (optional)
 * - Cache invalidation strategies
 */

import { CalculationInput, CalculationResult } from './calculations';

import { safeJsonParse } from './utils';

// ----- Cache Configuration -----

const CACHE_CONFIG = {
  MEMORY_CACHE_SIZE: 20, // Maximum number of items in memory cache
  CACHE_VERSION: 'v1.0', // Increment when calculation logic changes
  STORAGE_KEY: 'invoice-calculation-cache', // localStorage key
  TTL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  USE_PERSISTENT_STORAGE: true // Enable/disable localStorage caching
};

// ----- Cache Types -----

interface CacheItem<T> {
  timestamp: number; // When the item was cached
  result: T; // The cached result
  ttl: number; // Time to live in milliseconds
}

interface CacheMetadata {
  version: string;
  lastCleanup: number;
  itemCount: number;
}

// ----- Cache Key Generation -----

/**
 * Creates a stable cache key from calculation inputs
 */
function createCacheKey(input: CalculationInput): string {
  // Create a deterministic string representation of input
  // that can be used as a cache key
  const normalized = {
    startDate: input.startDate.toISOString().split('T')[0],
    endDate: input.endDate.toISOString().split('T')[0],
    includeEndDate: input.includeEndDate,
    // Sort amounts to ensure consistent key regardless of order
    amounts: [...input.amounts].sort((a, b) => a - b),
    splitPeriod: input.splitPeriod || 'yearly',
  };
  
  return JSON.stringify(normalized);
}

/**
 * Creates a full cache key with prefix and version
 */
function createFullCacheKey(key: string): string {
  return `${CACHE_CONFIG.CACHE_VERSION}:${key}`;
}

// ----- In-Memory Cache Implementation -----

// LRU cache data structure
class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, CacheItem<T>>;
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key: string): T | null {
    const fullKey = createFullCacheKey(key);
    const item = this.cache.get(fullKey);
    
    if (!item) return null;
    
    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(fullKey);
      return null;
    }
    
    // Move to most recently used position
    this.cache.delete(fullKey);
    this.cache.set(fullKey, item);
    
    return item.result;
  }
  
  set(key: string, value: T, ttl: number = CACHE_CONFIG.TTL): void {
    const fullKey = createFullCacheKey(key);
    
    // If at capacity, remove least recently used item (first item in map)
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(fullKey, {
      timestamp: Date.now(),
      result: value,
      ttl
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // For debugging
  getStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create memory cache instance
const memoryCache = new LRUCache<CalculationResult>(CACHE_CONFIG.MEMORY_CACHE_SIZE);

// ----- Persistent Cache Implementation -----

/**
 * Gets an item from localStorage cache
 */
function getFromPersistentCache(key: string): CalculationResult | null {
  if (!CACHE_CONFIG.USE_PERSISTENT_STORAGE) return null;
  
  try {
    const cache = safeJsonParse<Record<string, CacheItem<CalculationResult>>>(
      localStorage.getItem(CACHE_CONFIG.STORAGE_KEY) || '{}',
      {}
    );
    
    const fullKey = createFullCacheKey(key);
    const item = cache[fullKey];
    
    if (!item) return null;
    
    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      // Remove expired item
      delete cache[fullKey];
      localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(cache));
      return null;
    }
    
    return item.result;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

/**
 * Saves an item to localStorage cache
 */
function saveToPersistentCache(key: string, value: CalculationResult, ttl: number = CACHE_CONFIG.TTL): void {
  if (!CACHE_CONFIG.USE_PERSISTENT_STORAGE) return;
  
  try {
    const cache = safeJsonParse<Record<string, CacheItem<CalculationResult>>>(
      localStorage.getItem(CACHE_CONFIG.STORAGE_KEY) || '{}',
      {}
    );
    
    const fullKey = createFullCacheKey(key);
    
    // Add new item
    cache[fullKey] = {
      timestamp: Date.now(),
      result: value,
      ttl
    };
    
    // Periodically clean up expired items (once a day)
    const metadata = safeJsonParse<CacheMetadata>(
      localStorage.getItem(`${CACHE_CONFIG.STORAGE_KEY}_metadata`) || '{}',
      { version: CACHE_CONFIG.CACHE_VERSION, lastCleanup: 0, itemCount: 0 }
    );
    
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    if (metadata.lastCleanup < oneDayAgo || metadata.version !== CACHE_CONFIG.CACHE_VERSION) {
      // Clean up expired items or items from old version
      Object.keys(cache).forEach(cacheKey => {
        const cacheItem = cache[cacheKey];
        if (
          !cacheKey.startsWith(CACHE_CONFIG.CACHE_VERSION) || 
          Date.now() - cacheItem.timestamp > cacheItem.ttl
        ) {
          delete cache[cacheKey];
        }
      });
      
      // Update metadata
      metadata.lastCleanup = Date.now();
      metadata.version = CACHE_CONFIG.CACHE_VERSION;
      metadata.itemCount = Object.keys(cache).length;
      
      localStorage.setItem(`${CACHE_CONFIG.STORAGE_KEY}_metadata`, JSON.stringify(metadata));
    }
    
    localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

// ----- Public API -----

/**
 * Gets a calculation result from cache
 */
export function getCachedCalculation(input: CalculationInput): CalculationResult | null {
  const cacheKey = createCacheKey(input);
  
  // Try memory cache first (faster)
  const memoryResult = memoryCache.get(cacheKey);
  if (memoryResult) {
    return memoryResult;
  }
  
  // Try persistent cache if memory cache misses
  const persistentResult = getFromPersistentCache(cacheKey);
  if (persistentResult) {
    // Update memory cache for faster access next time
    memoryCache.set(cacheKey, persistentResult);
    return persistentResult;
  }
  
  return null;
}

/**
 * Saves a calculation result to cache
 */
export function cacheCalculation(input: CalculationInput, result: CalculationResult): void {
  const cacheKey = createCacheKey(input);
  
  // Save to memory cache
  memoryCache.set(cacheKey, result);
  
  // Save to persistent cache
  saveToPersistentCache(cacheKey, result);
}

/**
 * Clears all cached calculations
 */
export function clearCalculationCache(): void {
  // Clear memory cache
  memoryCache.clear();
  
  // Clear persistent cache
  if (CACHE_CONFIG.USE_PERSISTENT_STORAGE) {
    try {
      localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
      localStorage.removeItem(`${CACHE_CONFIG.STORAGE_KEY}_metadata`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

/**
 * Gets statistics about the calculation cache
 */
export function getCalculationCacheStats(): {
  memoryCache: { size: number; keys: string[] };
  persistentCache: { size: number; version: string; lastCleanup: string | null };
} {
  // Get memory cache stats
  const memoryCacheStats = memoryCache.getStats();
  
  // Get persistent cache stats
  let persistentCacheStats = { size: 0, version: CACHE_CONFIG.CACHE_VERSION, lastCleanup: null as string | null };
  
  if (CACHE_CONFIG.USE_PERSISTENT_STORAGE) {
    try {
      const metadata = safeJsonParse<CacheMetadata>(
        localStorage.getItem(`${CACHE_CONFIG.STORAGE_KEY}_metadata`) || '{}',
        { version: CACHE_CONFIG.CACHE_VERSION, lastCleanup: 0, itemCount: 0 }
      );
      
      persistentCacheStats = {
        size: metadata.itemCount,
        version: metadata.version,
        lastCleanup: metadata.lastCleanup ? new Date(metadata.lastCleanup).toISOString() : null
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
    }
  }
  
  return {
    memoryCache: memoryCacheStats,
    persistentCache: persistentCacheStats
  };
} 
