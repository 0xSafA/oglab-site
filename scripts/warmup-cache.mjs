#!/usr/bin/env node

/**
 * Cache Warmup Script
 * Run this after deployment or menu updates to pre-load Redis cache
 * 
 * Usage:
 *   node scripts/warmup-cache.mjs
 *   or
 *   npm run warmup-cache
 */

import { config } from 'dotenv';

// Load environment variables
config();

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
const API_URL = `${SITE_URL}/api/cache`;

console.log('🔥 Starting cache warmup...');
console.log(`📍 Target: ${API_URL}`);

async function warmupCache() {
  try {
    // 1. Check cache status
    console.log('\n📊 Checking cache status...');
    const statusResponse = await fetch(API_URL);
    const status = await statusResponse.json();
    
    if (!status.available) {
      console.error('❌ Redis is not available:', status.message);
      process.exit(1);
    }
    
    console.log('✅ Redis is available');
    console.log(`   Total keys: ${status.stats.totalKeys}`);
    
    // 2. Warmup menu cache
    console.log('\n🔥 Warming up menu cache...');
    const warmupResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'warmup-menu' }),
    });
    
    const warmupResult = await warmupResponse.json();
    
    if (warmupResult.success) {
      console.log('✅ Menu cache warmed up successfully');
    } else {
      console.error('❌ Menu warmup failed:', warmupResult.message);
    }
    
    // 3. Warmup critical caches
    console.log('\n🔥 Warming up all critical caches...');
    const criticalResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'warmup' }),
    });
    
    const criticalResult = await criticalResponse.json();
    
    if (criticalResult.success) {
      console.log('✅ All critical caches warmed up');
    } else {
      console.error('❌ Critical warmup failed:', criticalResult.message);
    }
    
    // 4. Check final status
    console.log('\n📊 Final cache status...');
    const finalResponse = await fetch(API_URL);
    const finalStatus = await finalResponse.json();
    console.log(`   Total keys: ${finalStatus.stats.totalKeys}`);
    
    console.log('\n🎉 Cache warmup complete!');
    
  } catch (error) {
    console.error('\n❌ Error during cache warmup:', error.message);
    process.exit(1);
  }
}

warmupCache();

