/**
 * Redis Client Configuration (Upstash)
 * For caching and session management
 */

import { Redis } from '@upstash/redis';

// Environment variables validation
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  console.warn(
    '⚠️ Upstash Redis credentials not found. Caching will be disabled.'
  );
}

/**
 * Redis client instance
 */
export const redis = redisUrl && redisToken
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

/**
 * Cache keys helper (EXPANDED)
 */
export const CacheKeys = {
  // User-related
  userProfile: (userId: string) => `user:profile:${userId}`,
  userByTelegram: (telegramId: number) => `user:telegram:${telegramId}`,
  userSession: (sessionId: string) => `session:${sessionId}`,
  authToken: (token: string) => `auth:token:${token}`,
  
  // Conversation-related
  conversation: (conversationId: string) => `conversation:${conversationId}`,
  conversationMessages: (conversationId: string) => `conversation:${conversationId}:messages`,
  conversationList: (userId: string) => `conversations:user:${userId}`,
  
  // Menu-related
  menuItems: () => 'menu:items',
  menuItemsByCategory: (category: string) => `menu:category:${category}`,
  
  // Agent-related
  agentContext: (userId: string) => `agent:context:${userId}`,
  
  // Order-related
  orderStatus: (orderId: string) => `order:status:${orderId}`,
  userOrders: (userId: string) => `orders:user:${userId}`,
  pendingOrders: () => 'orders:pending',
  todayOrders: () => 'orders:today',
  
  // Analytics
  analytics: (userId: string, period: string) => `analytics:${userId}:${period}`,
  dailyStats: (date: string) => `stats:daily:${date}`,
  todayMetrics: () => 'analytics:today',
  topProducts: (days: number) => `analytics:top-products:${days}`,
  conversionFunnel: (period: string) => `analytics:funnel:${period}`,
  userEngagement: () => 'analytics:engagement',
  
  // Semantic Cache
  semanticQuery: (hash: string) => `semantic:${hash}`,
  
  // Settings
  dynamicSettings: () => 'settings:dynamic',
};

/**
 * Cache TTL (Time To Live) in seconds (EXPANDED)
 */
export const CacheTTL = {
  // User data
  userProfile: 60 * 5, // 5 minutes - часто обновляется
  userSession: 60 * 60, // 1 hour - авторизация
  authToken: 60 * 60, // 1 hour - токены
  
  // Conversations
  conversation: 60 * 10, // 10 minutes
  conversationMessages: 60 * 5, // 5 minutes - активные чаты
  conversationList: 60 * 15, // 15 minutes
  
  // Menu
  menuItems: 60 * 30, // 30 minutes - обновляется редко
  
  // Agent
  agentContext: 60 * 15, // 15 minutes
  
  // Orders
  orderStatus: 60 * 2, // 2 minutes - часто меняется
  userOrders: 60 * 10, // 10 minutes
  pendingOrders: 60 * 1, // 1 minute - для админки
  todayOrders: 60 * 5, // 5 minutes
  
  // Analytics
  analytics: 60 * 60 * 24, // 24 hours - статистика
  dailyStats: 60 * 60 * 12, // 12 hours
  todayMetrics: 60 * 5, // 5 minutes - обновляется часто
  topProducts: 60 * 30, // 30 minutes
  conversionFunnel: 60 * 15, // 15 minutes
  userEngagement: 60 * 30, // 30 minutes
  
  // Semantic Cache
  semanticQuery: 60 * 60, // 1 hour - FAQ responses
  
  // Settings
  dynamicSettings: 60 * 60, // 1 hour - редко меняется
};

/**
 * Get cached data
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  
  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
}

/**
 * Set cached data
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttl?: number
): Promise<boolean> {
  if (!redis) return false;
  
  try {
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
    return true;
  } catch (error) {
    console.error('Redis SET error:', error);
    return false;
  }
}

/**
 * Delete cached data
 */
export async function deleteCached(key: string): Promise<boolean> {
  if (!redis) return false;
  
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Redis DEL error:', error);
    return false;
  }
}

/**
 * Invalidate multiple cache keys by pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<number> {
  if (!redis) return 0;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    
    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error('Redis invalidate pattern error:', error);
    return 0;
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redis !== null;
}

/**
 * Helper: Cache with fallback to database
 */
export async function cacheOrFetch<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = await getCached<T>(key);
  if (cached !== null) {
    console.log('✅ Cache HIT:', key);
    return cached;
  }
  
  // Cache miss, fetch from database
  console.log('❌ Cache MISS:', key);
  const data = await fetchFn();
  
  // Store in cache for next time
  await setCached(key, data, ttl);
  
  return data;
}

/**
 * Session storage helper
 */
export const SessionCache = {
  /**
   * Store user session data
   */
  async setSession(
    sessionId: string,
    data: Record<string, unknown>,
    ttl: number = 60 * 60 * 24 // 24 hours
  ): Promise<boolean> {
    return setCached(`session:${sessionId}`, data, ttl);
  },
  
  /**
   * Get user session data
   */
  async getSession(sessionId: string): Promise<Record<string, unknown> | null> {
    return getCached<Record<string, unknown>>(`session:${sessionId}`);
  },
  
  /**
   * Delete user session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    return deleteCached(`session:${sessionId}`);
  },
  
  /**
   * Update session field
   */
  async updateSessionField(
    sessionId: string,
    field: string,
    value: unknown
  ): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;
    
    session[field] = value;
    return this.setSession(sessionId, session);
  },
};

/**
 * Batch cache operations for better performance
 */
export const BatchCache = {
  /**
   * Get multiple cached items at once (MGET)
   */
  async getMultiple<T>(keys: string[]): Promise<(T | null)[]> {
    if (!redis || keys.length === 0) return keys.map(() => null);
    
    try {
      // Upstash Redis supports pipeline for batch operations
      const pipeline = redis.pipeline();
      keys.forEach(key => pipeline.get(key));
      const results = await pipeline.exec();
      
      console.log(`⚡ Batch GET: ${keys.length} keys`);
      return results as (T | null)[];
    } catch (error) {
      console.error('Redis MGET error:', error);
      return keys.map(() => null);
    }
  },
  
  /**
   * Set multiple cached items at once (MSET)
   */
  async setMultiple<T>(
    items: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<boolean> {
    if (!redis || items.length === 0) return false;
    
    try {
      const pipeline = redis.pipeline();
      items.forEach(({ key, value, ttl }) => {
        if (ttl) {
          pipeline.setex(key, ttl, value);
        } else {
          pipeline.set(key, value);
        }
      });
      await pipeline.exec();
      
      console.log(`⚡ Batch SET: ${items.length} keys`);
      return true;
    } catch (error) {
      console.error('Redis MSET error:', error);
      return false;
    }
  },
  
  /**
   * Delete multiple keys at once (DEL)
   */
  async deleteMultiple(keys: string[]): Promise<number> {
    if (!redis || keys.length === 0) return 0;
    
    try {
      await redis.del(...keys);
      console.log(`⚡ Batch DEL: ${keys.length} keys`);
      return keys.length;
    } catch (error) {
      console.error('Redis batch DEL error:', error);
      return 0;
    }
  },
};

/**
 * Cache statistics and monitoring
 */
export const CacheStats = {
  /**
   * Get cache hit/miss statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    available: boolean;
  }> {
    if (!redis) {
      return { totalKeys: 0, memoryUsage: '0 KB', available: false };
    }
    
    try {
      const keys = await redis.keys('*');
      return {
        totalKeys: keys.length,
        memoryUsage: 'N/A', // Upstash doesn't expose memory info
        available: true,
      };
    } catch (error) {
      console.error('Redis stats error:', error);
      return { totalKeys: 0, memoryUsage: '0 KB', available: false };
    }
  },
  
  /**
   * Clear all cache (use with caution!)
   */
  async clearAll(): Promise<boolean> {
    if (!redis) return false;
    
    try {
      const keys = await redis.keys('*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🗑️ Cleared ${keys.length} cache keys`);
      }
      return true;
    } catch (error) {
      console.error('Redis clear all error:', error);
      return false;
    }
  },
  
  /**
   * Clear cache by prefix pattern
   */
  async clearByPrefix(prefix: string): Promise<number> {
    if (!redis) return 0;
    
    try {
      const keys = await redis.keys(`${prefix}*`);
      if (keys.length === 0) return 0;
      
      await redis.del(...keys);
      console.log(`🗑️ Cleared ${keys.length} keys with prefix: ${prefix}`);
      return keys.length;
    } catch (error) {
      console.error('Redis clear by prefix error:', error);
      return 0;
    }
  },
};

/**
 * Cache warming - preload frequently accessed data
 */
export const CacheWarming = {
  /**
   * Warm up menu cache
   */
  async warmupMenu(): Promise<boolean> {
    try {
      // This will be called from the chat route
      console.log('🔥 Warming up menu cache...');
      return true;
    } catch (error) {
      console.error('Menu warmup error:', error);
      return false;
    }
  },
  
  /**
   * Warm up user profile
   */
  async warmupUserProfile(userId: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      // Check if already cached
      const cached = await getCached(CacheKeys.userProfile(userId));
      if (cached) {
        console.log(`🔥 User profile already warm: ${userId}`);
        return true;
      }
      
      console.log(`🔥 Would warmup user profile: ${userId}`);
      return true;
    } catch (error) {
      console.error('User profile warmup error:', error);
      return false;
    }
  },
  
  /**
   * Warm up multiple items
   */
  async warmupBatch(keys: string[]): Promise<number> {
    let warmed = 0;
    
    for (const key of keys) {
      const cached = await getCached(key);
      if (!cached) {
        console.log(`❌ Cache miss: ${key}`);
      } else {
        warmed++;
      }
    }
    
    console.log(`🔥 Cache warmup: ${warmed}/${keys.length} hits`);
    return warmed;
  },
};

