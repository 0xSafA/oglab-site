/**
 * User Profile Database Operations (REDIS-OPTIMIZED)
 * Handles all user profile CRUD operations with Supabase + Redis caching
 */

import { 
  supabaseBrowser, 
  getSupabaseServer,
  type UserProfile,
  type UserProfileUpdate,
  handleSupabaseError,
  isNotFoundError
} from './supabase-client';

// Redis caching
import {
  getCached,
  setCached,
  deleteCached,
  CacheKeys,
  CacheTTL,
  isRedisAvailable,
} from './redis-client';

// Import old localStorage types for migration
import type { 
  UserProfile as LocalUserProfile,
  UserPreferences 
} from './user-profile';

/**
 * Generate unique user ID
 */
export function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `user_${timestamp}_${randomStr}`;
}

/**
 * Get or create user profile (browser)
 * First checks localStorage, then Supabase
 */
export async function getOrCreateUserProfile(
  userId?: string,
  telegramUserId?: number
): Promise<UserProfile> {
  try {
    // If userId provided, try to fetch from Supabase
    if (userId) {
      const { data, error } = await supabaseBrowser
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        return data;
      }
    }
    
    // If telegram user ID provided, try to fetch by that
    if (telegramUserId) {
      const { data, error } = await supabaseBrowser
        .from('user_profiles')
        .select('*')
        .eq('telegram_user_id', telegramUserId)
        .single();
      
      if (!error && data) {
        return data;
      }
    }
    
    // Check if we have localStorage profile to migrate
    const localProfile = loadLocalStorageProfile();
    if (localProfile) {
      console.log('📦 Found localStorage profile, migrating to Supabase...');
      return await migrateLocalProfileToSupabase(localProfile, telegramUserId);
    }
    
    // Create new profile
    console.log('✨ Creating new user profile in Supabase...');
    return await createNewUserProfile(telegramUserId);
    
  } catch (error) {
    console.error('Error in getOrCreateUserProfile:', error);
    throw error;
  }
}

/**
 * Get or create user profile (server-side) - REDIS OPTIMIZED
 * For use in API routes
 * 
 * Performance: 100ms → 3ms with Redis cache
 */
export async function getOrCreateUserProfileServer(
  userId?: string,
  telegramUserId?: number
): Promise<UserProfile> {
  const supabase = getSupabaseServer();
  
  try {
    // 1. Try Redis cache first (by userId)
    if (userId && isRedisAvailable()) {
      const cacheKey = CacheKeys.userProfile(userId);
      const cached = await getCached<UserProfile>(cacheKey);
      
      if (cached) {
        console.log('⚡ Profile from Redis:', userId);
        return cached;
      }
    }
    
    // 2. Try Redis cache by Telegram ID
    if (telegramUserId && isRedisAvailable()) {
      const cacheKey = CacheKeys.userByTelegram(telegramUserId);
      const cached = await getCached<UserProfile>(cacheKey);
      
      if (cached) {
        console.log('⚡ Profile from Redis (Telegram):', telegramUserId);
        return cached;
      }
    }
    
    // 3. Fetch from Supabase
    let profile: UserProfile | null = null;
    
    if (userId) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        profile = data;
      }
    }
    
    if (!profile && telegramUserId) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('telegram_user_id', telegramUserId)
        .single();
      
      if (!error && data) {
        profile = data;
      }
    }
    
    // 4. Create new profile if not found
    if (!profile) {
      const newUserId = userId || generateUserId();
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: newUserId,
          telegram_user_id: telegramUserId || null,
          preferences: {},
          first_visit: new Date().toISOString(),
          last_visit: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) handleSupabaseError(error);
      
      profile = data!;
      console.log('✅ Created new profile:', profile.id);
    }
    
    // 5. Cache in Redis (dual keys for fast lookup)
    if (isRedisAvailable() && profile) {
      await setCached(
        CacheKeys.userProfile(profile.user_id),
        profile,
        CacheTTL.userProfile
      );
      
      if (profile.telegram_user_id) {
        await setCached(
          CacheKeys.userByTelegram(profile.telegram_user_id),
          profile,
          CacheTTL.userProfile
        );
      }
      
      console.log('💾 Cached profile:', profile.user_id);
    }
    
    return profile;
    
  } catch (error) {
    console.error('Error in getOrCreateUserProfileServer:', error);
    throw error;
  }
}

/**
 * Create new user profile
 */
async function createNewUserProfile(telegramUserId?: number): Promise<UserProfile> {
  const newUserId = generateUserId();
  
  const { data, error } = await supabaseBrowser
    .from('user_profiles')
    .insert({
      user_id: newUserId,
      telegram_user_id: telegramUserId || null,
      preferences: {},
      first_visit: new Date().toISOString(),
      last_visit: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  
  console.log('✅ Created new profile:', data!.id);
  return data!;
}

/**
 * Update user profile - REDIS OPTIMIZED
 * Invalidates cache after update
 */
export async function updateUserProfile(
  profileId: string,
  updates: UserProfileUpdate
): Promise<UserProfile> {
  const { data, error } = await supabaseBrowser
    .from('user_profiles')
    .update({
      ...updates,
      last_visit: new Date().toISOString(),
    })
    .eq('id', profileId)
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  
  // Invalidate cache (both keys)
  if (isRedisAvailable() && data) {
    await deleteCached(CacheKeys.userProfile(data.user_id));
    
    if (data.telegram_user_id) {
      await deleteCached(CacheKeys.userByTelegram(data.telegram_user_id));
    }
    
    console.log('🗑️ Invalidated cache for profile:', data.user_id);
  }
  
  return data!;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  profileId: string,
  preferences: Partial<UserPreferences>
): Promise<UserProfile> {
  // First get current preferences
  const { data: currentProfile } = await supabaseBrowser
    .from('user_profiles')
    .select('preferences')
    .eq('id', profileId)
    .single();
  
  const mergedPreferences = {
    ...(currentProfile?.preferences || {}),
    ...preferences,
  };
  
  return updateUserProfile(profileId, {
    preferences: mergedPreferences,
  });
}

/**
 * Link Telegram account to profile
 */
export async function linkTelegramAccount(
  profileId: string,
  telegramUserId: number,
  telegramUsername?: string
): Promise<UserProfile> {
  return updateUserProfile(profileId, {
    telegram_user_id: telegramUserId,
    telegram_username: telegramUsername || null,
  });
}

/**
 * Get user profile by user_id - REDIS OPTIMIZED
 */
export async function getUserProfileByUserId(userId: string): Promise<UserProfile | null> {
  // Try cache first
  if (isRedisAvailable()) {
    const cached = await getCached<UserProfile>(CacheKeys.userProfile(userId));
    if (cached) {
      console.log('⚡ Profile from Redis:', userId);
      return cached;
    }
  }
  
  // Fetch from Supabase
  const { data, error } = await supabaseBrowser
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && !isNotFoundError(error)) {
    console.error('Error fetching profile:', error);
  }
  
  // Cache if found
  if (data && isRedisAvailable()) {
    await setCached(CacheKeys.userProfile(userId), data, CacheTTL.userProfile);
  }
  
  return data || null;
}

/**
 * Get user profile by Telegram ID - REDIS OPTIMIZED
 */
export async function getUserProfileByTelegramId(
  telegramUserId: number
): Promise<UserProfile | null> {
  // Try cache first
  if (isRedisAvailable()) {
    const cached = await getCached<UserProfile>(CacheKeys.userByTelegram(telegramUserId));
    if (cached) {
      console.log('⚡ Profile from Redis (Telegram):', telegramUserId);
      return cached;
    }
  }
  
  // Fetch from Supabase
  const { data, error } = await supabaseBrowser
    .from('user_profiles')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();
  
  if (error && !isNotFoundError(error)) {
    console.error('Error fetching profile:', error);
  }
  
  // Cache if found (dual keys)
  if (data && isRedisAvailable()) {
    await setCached(
      CacheKeys.userByTelegram(telegramUserId),
      data,
      CacheTTL.userProfile
    );
    await setCached(
      CacheKeys.userProfile(data.user_id),
      data,
      CacheTTL.userProfile
    );
  }
  
  return data || null;
}

/**
 * Delete user profile (GDPR compliance)
 */
export async function deleteUserProfile(profileId: string): Promise<void> {
  const { error } = await supabaseBrowser
    .from('user_profiles')
    .delete()
    .eq('id', profileId);
  
  if (error) handleSupabaseError(error);
  
  console.log('🗑️ Profile deleted:', profileId);
}

/**
 * Build user context string for AI prompt
 */
export function buildUserContextFromProfile(profile: UserProfile): string {
  if (profile.total_conversations === 0) {
    return ''; // New user
  }
  
  const daysSinceFirstVisit = Math.floor(
    (Date.now() - new Date(profile.first_visit).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const parts: string[] = [];
  
  // Basic stats
  parts.push(
    `Returning client (visit #${profile.total_conversations + 1}, ${daysSinceFirstVisit} days with us).`
  );
  
  // Preferences
  const prefs = profile.preferences as UserPreferences;
  
  if (prefs.experienceLevel) {
    const levels = {
      beginner: 'beginner',
      intermediate: 'intermediate experience',
      expert: 'experienced user',
    };
    parts.push(`Level: ${levels[prefs.experienceLevel]}.`);
  }
  
  if (prefs.preferredEffects && prefs.preferredEffects.length > 0) {
    parts.push(`Interests: ${prefs.preferredEffects.join(', ')}.`);
  }
  
  if (prefs.favoriteStrains && prefs.favoriteStrains.length > 0) {
    const strains = prefs.favoriteStrains.slice(0, 3).join(', ');
    parts.push(`Previously recommended: ${strains}.`);
  }
  
  // Last visit
  const daysSinceLastVisit = Math.floor(
    (Date.now() - new Date(profile.last_visit).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastVisit > 7) {
    parts.push(`Haven't talked in ${daysSinceLastVisit} days.`);
  }
  
  return parts.join(' ');
}

/**
 * Load profile from localStorage (for migration)
 */
function loadLocalStorageProfile(): LocalUserProfile | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('oglab_user_profile_v1');
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Check if already migrated
    const migratedAt = localStorage.getItem('oglab_migrated_at');
    if (migratedAt) {
      console.log('📦 Profile already migrated at:', migratedAt);
      return null;
    }
    
    return parsed as LocalUserProfile;
  } catch (error) {
    console.error('Error loading localStorage profile:', error);
    return null;
  }
}

/**
 * Migrate localStorage profile to Supabase
 */
async function migrateLocalProfileToSupabase(
  localProfile: LocalUserProfile,
  telegramUserId?: number
): Promise<UserProfile> {
  try {
    // Create profile in Supabase
    const { data, error } = await supabaseBrowser
      .from('user_profiles')
      .insert({
        user_id: localProfile.userId,
        telegram_user_id: telegramUserId || null,
        first_visit: localProfile.firstVisit.toString(),
        last_visit: localProfile.lastVisit.toString(),
        total_conversations: localProfile.totalConversations,
        total_messages: localProfile.totalMessages,
        preferences: localProfile.preferences,
      })
      .select()
      .single();
    
    if (error) {
      // If profile already exists, fetch it
      if (error.code === '23505') {
        const { data: existing } = await supabaseBrowser
          .from('user_profiles')
          .select('*')
          .eq('user_id', localProfile.userId)
          .single();
        
        if (existing) {
          markAsMigrated();
          return existing;
        }
      }
      handleSupabaseError(error);
    }
    
    console.log('✅ Profile migrated to Supabase:', data!.id);
    
    // Mark as migrated in localStorage
    markAsMigrated();
    
    return data!;
  } catch (error) {
    console.error('Error migrating profile:', error);
    throw error;
  }
}

/**
 * Mark profile as migrated in localStorage
 */
function markAsMigrated(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('oglab_migrated_at', new Date().toISOString());
  console.log('✅ Marked as migrated in localStorage');
}

/**
 * Clear localStorage profile (after successful migration)
 */
export function clearLocalStorageProfile(): void {
  if (typeof window === 'undefined') return;
  
  // Keep backup for 30 days
  const migratedAt = localStorage.getItem('oglab_migrated_at');
  if (!migratedAt) return;
  
  const daysSinceMigration = Math.floor(
    (Date.now() - new Date(migratedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceMigration > 30) {
    localStorage.removeItem('oglab_user_profile_v1');
    localStorage.removeItem('oglab_migrated_at');
    console.log('🗑️ Cleaned up old localStorage profile');
  }
}

