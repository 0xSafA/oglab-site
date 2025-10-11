/**
 * Analytics API
 * Dashboard metrics and statistics
 */

import { NextRequest } from 'next/server';
import {
  getTodayMetrics,
  getTopProducts,
  getUserEngagementMetrics,
  getAIPerformanceMetrics,
} from '@/lib/analytics-db';

// GET: Get analytics data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metric = searchParams.get('metric');
    
    if (!metric) {
      return Response.json(
        { error: 'Missing required parameter: metric' },
        { status: 400 }
      );
    }
    
    switch (metric) {
      case 'today':
        const todayMetrics = await getTodayMetrics();
        return Response.json(todayMetrics);
      
      case 'top-products':
        const daysBack = parseInt(searchParams.get('daysBack') || '7');
        const limit = parseInt(searchParams.get('limit') || '10');
        const topProducts = await getTopProducts({ daysBack, limit });
        return Response.json(topProducts);
      
      case 'user-engagement':
        const userMetrics = await getUserEngagementMetrics();
        return Response.json(userMetrics);
      
      case 'ai-performance':
        const aiMetrics = await getAIPerformanceMetrics();
        return Response.json(aiMetrics);
      
      case 'all':
        // Get all metrics at once
        const [today, topProds, userEng, aiPerf] = await Promise.all([
          getTodayMetrics(),
          getTopProducts({ daysBack: 7, limit: 10 }),
          getUserEngagementMetrics(),
          getAIPerformanceMetrics(),
        ]);
        
        return Response.json({
          today,
          topProducts: topProds,
          userEngagement: userEng,
          aiPerformance: aiPerf,
        });
      
      default:
        return Response.json(
          { error: 'Invalid metric type' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error in GET /api/analytics:', error);
    return Response.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

