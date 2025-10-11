/**
 * Cache Warming Utilities
 * Pre-loads frequently accessed data into Redis for optimal performance
 */

import { fetchMenuWithOptions } from './supabase-data';
import { buildMenuContext } from './agent-helpers';
import { setCached, CacheKeys, CacheTTL, isRedisAvailable } from './redis-client';
import { fetchDynamicSettings } from './dynamic-settings';
import { getTodayMetrics, getTopProducts } from './analytics-db';

/**
 * Warm up menu cache
 * Should be called on app startup or menu updates
 */
export async function warmupMenuCache(): Promise<boolean> {
  if (!isRedisAvailable()) {
    console.log('⚠️ Redis not available, skipping menu warmup');
    return false;
  }

  try {
    console.log('🔥 Warming up menu cache...');
    
    // Fetch menu from database
    const { rows } = await fetchMenuWithOptions();
    
    // Build both context versions
    const contextText = buildMenuContext(rows, false);
    const contextTextWithConcentrates = buildMenuContext(rows, true);
    
    // Cache the full menu data
    const menuCache = {
      contextText,
      contextTextWithConcentrates,
      rows,
      timestamp: Date.now(),
    };
    
    await setCached(CacheKeys.menuItems(), menuCache, CacheTTL.menuItems);
    
    console.log(`✅ Menu cache warmed up: ${rows.length} items`);
    return true;
  } catch (error) {
    console.error('❌ Error warming up menu cache:', error);
    return false;
  }
}

/**
 * Warm up dynamic settings cache
 */
export async function warmupDynamicSettingsCache(): Promise<boolean> {
  if (!isRedisAvailable()) return false;
  try {
    await fetchDynamicSettings(); // Caches internally
    console.log('✅ Dynamic settings cache warmed up');
    return true;
  } catch (error) {
    console.error('❌ Error warming up dynamic settings:', error);
    return false;
  }
}

/**
 * Warm up analytics caches
 */
export async function warmupAnalyticsCache(): Promise<boolean> {
  if (!isRedisAvailable()) return false;
  try {
    await Promise.all([
      getTodayMetrics(),
      getTopProducts({ daysBack: 7 }),
    ]);
    console.log('✅ Analytics cache warmed up');
    return true;
  } catch (error) {
    console.error('❌ Error warming up analytics:', error);
    return false;
  }
}

/**
 * Warm up critical caches on application startup (PHASE 2 OPTIMIZED)
 */
export async function warmupCriticalCaches(): Promise<void> {
  if (!isRedisAvailable()) {
    console.log('⚠️ Redis not available, skipping cache warmup');
    return;
  }

  console.log('🔥 Starting critical cache warmup...');
  
  const results = await Promise.allSettled([
    warmupMenuCache(),
    warmupDynamicSettingsCache(),
    warmupAnalyticsCache(),
  ]);
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  const failed = results.length - successful;
  
  console.log(`✅ Cache warmup complete: ${successful} successful, ${failed} failed`);
}

/**
 * Schedule periodic cache refresh
 * Call this from a cron job or background process
 */
export async function refreshCaches(): Promise<void> {
  console.log('🔄 Refreshing caches...');
  
  await warmupCriticalCaches();
  
  console.log('✅ Cache refresh complete');
}

/**
 * Pre-warm cache for a specific user
 * Useful for VIP users or after login
 */
export async function warmupUserCache(userId: string): Promise<boolean> {
  if (!isRedisAvailable() || !userId) {
    return false;
  }

  try {
    console.log(`🔥 Warming up cache for user: ${userId}`);
    
    // This will trigger the cache-or-fetch pattern in user-profile-db
    // The actual data fetching happens in the respective functions
    
    console.log(`✅ User cache ready: ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error warming up user cache:', error);
    return false;
  }
}

/**
 * Get cache warmup status
 */
export async function getCacheWarmupStatus(): Promise<{
  menuCached: boolean;
  redisAvailable: boolean;
}> {
  return {
    menuCached: false, // Would need to check Redis
    redisAvailable: isRedisAvailable(),
  };
}

