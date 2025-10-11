/**
 * Semantic Cache with pgvector + Redis Layer
 * Two-tier caching: Redis for exact matches, pgvector for semantic similarity
 */

import OpenAI from 'openai';
import { getSupabaseServer } from './supabase-client';
import {
  getCached,
  setCached,
  CacheKeys,
  CacheTTL,
  isRedisAvailable,
} from './redis-client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Similarity threshold (0.85 = 85% similar)
const SIMILARITY_THRESHOLD = 0.85;

/**
 * Generate embedding for text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Find semantically similar cached query
 * TWO-TIER: Redis exact match → pgvector semantic match
 * Performance: 50-5000ms → 3ms for popular queries
 */
export async function findSimilarCachedQuery(
  query: string,
  language?: string,
  threshold: number = SIMILARITY_THRESHOLD
): Promise<{
  found: boolean;
  response?: string;
  similarity?: number;
  cacheId?: string;
} | null> {
  try {
    // Simple hash for exact query matching in Redis
    const queryHash = Buffer.from(query.toLowerCase().trim()).toString('base64').substring(0, 50);
    
    // 1. Try Redis cache first (for popular exact queries)
    if (isRedisAvailable()) {
      const cached = await getCached<{ response: string; cacheId: string }>(
        CacheKeys.semanticQuery(queryHash)
      );
      
      if (cached) {
        console.log('⚡ Semantic query from Redis (exact match)');
        return {
          found: true,
          response: cached.response,
          similarity: 1.0, // Exact match
          cacheId: cached.cacheId,
        };
      }
    }
    
    // 2. Try pgvector semantic search
    const embedding = await generateEmbedding(query);
    
    const supabase = getSupabaseServer();
    
    const { data, error } = await supabase.rpc('find_similar_cached_queries', {
      query_embedding: JSON.stringify(embedding),
      similarity_threshold: threshold,
      match_limit: 1,
    });
    
    if (error) {
      console.error('Error finding similar queries:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return { found: false };
    }
    
    const match = data[0];
    // Optional language check
    if (language) {
      const { data: row } = await supabase
        .from('semantic_cache')
        .select('id, language')
        .eq('id', match.id)
        .single();
      if (row && row.language && row.language !== language) {
        return { found: false };
      }
    }
    
    // Increment hit count
    await supabase.rpc('increment_cache_hit', {
      cache_id: match.id,
    });
    
    console.log(`✅ Semantic cache HIT! Similarity: ${(match.similarity * 100).toFixed(1)}%`);
    
    // 3. Cache popular queries in Redis (if high similarity)
    if (isRedisAvailable() && match.similarity >= 0.95) {
      await setCached(
        CacheKeys.semanticQuery(queryHash),
        { response: match.response_text, cacheId: match.id },
        CacheTTL.semanticQuery
      );
      console.log('💾 Cached semantic query in Redis');
    }
    
    return {
      found: true,
      response: match.response_text,
      similarity: match.similarity,
      cacheId: match.id,
    };
    
  } catch (error) {
    console.error('Error in findSimilarCachedQuery:', error);
    return null;
  }
}

/**
 * Add query and response to semantic cache
 */
export async function addToSemanticCache(params: {
  query: string;
  response: string;
  responseType?: 'faq' | 'product_info' | 'general';
  language?: string;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  try {
    const {
      query,
      response,
      responseType = 'general',
      language = 'en',
      metadata = {},
    } = params;
    // PII guard: skip caching if response contains phone/address-like patterns
    const hasPII = /\b\+?\d[\d\s().-]{7,}\b/.test(response) || /\b(room|комната|address|адрес|отель|hotel)\b/i.test(response);
    if (hasPII) return false;
    
    // Generate embedding
    const embedding = await generateEmbedding(query);
    
    const supabase = getSupabaseServer();
    
    const { error } = await supabase.from('semantic_cache').insert({
      query_text: query,
      query_embedding: JSON.stringify(embedding),
      response_text: response,
      response_type: responseType,
      language,
      metadata,
    });
    
    if (error) {
      console.error('Error adding to semantic cache:', error);
      return false;
    }
    
    console.log('✅ Added to semantic cache:', query.substring(0, 50));
    return true;
    
  } catch (error) {
    console.error('Error in addToSemanticCache:', error);
    return false;
  }
}

/**
 * Update existing cache entry
 */
export async function updateSemanticCache(
  cacheId: string,
  response: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseServer();
    
    const { error } = await supabase
      .from('semantic_cache')
      .update({
        response_text: response,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cacheId);
    
    if (error) {
      console.error('Error updating semantic cache:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateSemanticCache:', error);
    return false;
  }
}

/**
 * Get cache statistics
 */
export async function getSemanticCacheStats(): Promise<{
  total: number;
  byLanguage: Record<string, number>;
  byType: Record<string, number>;
  topHits: Array<{
    query: string;
    hits: number;
  }>;
}> {
  try {
    const supabase = getSupabaseServer();
    
    // Get total count
    const { count: total } = await supabase
      .from('semantic_cache')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    // Get by language
    const { data: byLanguageData } = await supabase
      .from('semantic_cache')
      .select('language')
      .eq('is_active', true);
    
    const byLanguage: Record<string, number> = {};
    byLanguageData?.forEach((row) => {
      byLanguage[row.language] = (byLanguage[row.language] || 0) + 1;
    });
    
    // Get by type
    const { data: byTypeData } = await supabase
      .from('semantic_cache')
      .select('response_type')
      .eq('is_active', true);
    
    const byType: Record<string, number> = {};
    byTypeData?.forEach((row) => {
      byType[row.response_type] = (byType[row.response_type] || 0) + 1;
    });
    
    // Get top hits
    const { data: topHitsData } = await supabase
      .from('semantic_cache')
      .select('query_text, hit_count')
      .eq('is_active', true)
      .order('hit_count', { ascending: false })
      .limit(10);
    
    const topHits = topHitsData?.map((row) => ({
      query: row.query_text,
      hits: row.hit_count,
    })) || [];
    
    return {
      total: total || 0,
      byLanguage,
      byType,
      topHits,
    };
  } catch (error) {
    console.error('Error getting semantic cache stats:', error);
    return {
      total: 0,
      byLanguage: {},
      byType: {},
      topHits: [],
    };
  }
}

/**
 * Warm up semantic cache with FAQs
 */
export async function warmupSemanticCache(): Promise<number> {
  console.log('🔥 Warming up semantic cache...');
  
  const faqs = [
    {
      query: 'How can I order?',
      response: 'You can order through our website, Telegram bot, or by calling us. Minimum order is 20g for flowers.',
      language: 'en',
    },
    {
      query: 'What strains do you recommend for beginners?',
      response: 'For beginners, I recommend starting with mild Indica strains like Purple Haze or OG Kush. They provide relaxation without being overwhelming.',
      language: 'en',
    },
    {
      query: 'Как я могу заказать?',
      response: 'Вы можете заказать через наш сайт, Telegram бот, или позвонив нам. Минимальный заказ - 20г для цветов.',
      language: 'ru',
    },
  ];
  
  let added = 0;
  
  for (const faq of faqs) {
    const success = await addToSemanticCache({
      query: faq.query,
      response: faq.response,
      responseType: 'faq',
      language: faq.language,
    });
    
    if (success) added++;
  }
  
  console.log(`✅ Added ${added} FAQs to semantic cache`);
  return added;
}

