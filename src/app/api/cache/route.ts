/**
 * Cache Management API
 * Provides endpoints for cache warming, clearing, and monitoring
 */

import { NextRequest } from 'next/server';
import { CacheStats, isRedisAvailable } from '@/lib/redis-client';
import { warmupMenuCache, warmupCriticalCaches } from '@/lib/cache-warmup';

/**
 * GET /api/cache
 * Get cache statistics
 */
export async function GET() {
  try {
    if (!isRedisAvailable()) {
      return Response.json({
        available: false,
        message: 'Redis is not configured',
      });
    }

    const stats = await CacheStats.getStats();

    return Response.json({
      available: true,
      stats,
      message: 'Cache statistics retrieved',
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return Response.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cache
 * Perform cache operations (warmup, clear, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!isRedisAvailable()) {
      return Response.json(
        { error: 'Redis is not configured' },
        { status: 503 }
      );
    }

    switch (action) {
      case 'warmup':
        await warmupCriticalCaches();
        return Response.json({
          success: true,
          message: 'Cache warmup initiated',
        });

      case 'warmup-menu':
        const success = await warmupMenuCache();
        return Response.json({
          success,
          message: success ? 'Menu cache warmed up' : 'Menu warmup failed',
        });

      case 'clear':
        // Only allow with admin auth (you should add auth check here)
        const cleared = await CacheStats.clearAll();
        return Response.json({
          success: cleared,
          message: cleared ? 'Cache cleared' : 'Failed to clear cache',
        });

      case 'clear-prefix':
        const { prefix } = body;
        if (!prefix) {
          return Response.json(
            { error: 'Prefix is required' },
            { status: 400 }
          );
        }
        const count = await CacheStats.clearByPrefix(prefix);
        return Response.json({
          success: true,
          cleared: count,
          message: `Cleared ${count} keys with prefix: ${prefix}`,
        });

      default:
        return Response.json(
          { error: 'Invalid action. Use: warmup, warmup-menu, clear, clear-prefix' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in cache operation:', error);
    return Response.json(
      { error: 'Cache operation failed' },
      { status: 500 }
    );
  }
}

