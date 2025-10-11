/**
 * Migration Utility: localStorage → Supabase
 * One-time migration of user profiles and conversations
 */

'use client';

import { supabaseBrowser } from './supabase-client';
import type { UserProfile as LocalUserProfile } from './user-profile';

const MIGRATION_KEY = 'oglab_migrated_at';
const LOCAL_PROFILE_KEY = 'oglab_user_profile_v1';
const LOCAL_CONVERSATIONS_KEY_PREFIX = 'oglab_conversation_';

/**
 * Check if migration has already been performed
 */
export function isMigrated(): boolean {
  if (typeof window === 'undefined') return true;
  
  const migratedAt = localStorage.getItem(MIGRATION_KEY);
  return !!migratedAt;
}

/**
 * Get migration timestamp
 */
export function getMigrationTimestamp(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(MIGRATION_KEY);
}

/**
 * Perform full migration from localStorage to Supabase
 */
export async function migrateToSupabase(): Promise<{
  success: boolean;
  profileId?: string;
  conversationsMigrated?: number;
  error?: string;
}> {
  if (typeof window === 'undefined') {
    return {
      success: false,
      error: 'Cannot run migration on server-side',
    };
  }
  
  // Check if already migrated
  if (isMigrated()) {
    console.log('✅ Migration already completed');
    return {
      success: true,
      profileId: undefined,
      conversationsMigrated: 0,
    };
  }
  
  try {
    // 1. Load localStorage profile
    const localProfileStr = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (!localProfileStr) {
      console.log('ℹ️ No localStorage profile found, skipping migration');
      markAsMigrated();
      return {
        success: true,
        profileId: undefined,
        conversationsMigrated: 0,
      };
    }
    
    const localProfile: LocalUserProfile = JSON.parse(localProfileStr);
    console.log('📦 Found localStorage profile:', localProfile.userId);
    
    // 2. Check if profile already exists in Supabase
    const { data: existingProfile } = await supabaseBrowser
      .from('user_profiles')
      .select('id, user_id')
      .eq('user_id', localProfile.userId)
      .single();
    
    let profileId: string;
    
    if (existingProfile) {
      console.log('✅ Profile already exists in Supabase:', existingProfile.id);
      profileId = existingProfile.id;
    } else {
      // 3. Create profile in Supabase
      const { data: newProfile, error: profileError } = await supabaseBrowser
        .from('user_profiles')
        .insert({
          user_id: localProfile.userId,
          session_id: null,
          telegram_user_id: null,
          telegram_username: null,
          first_visit: new Date(localProfile.firstVisit).toISOString(),
          last_visit: new Date(localProfile.lastVisit).toISOString(),
          total_conversations: localProfile.totalConversations,
          total_messages: localProfile.totalMessages,
          total_orders: 0,
          total_spent: 0,
          preferences: (localProfile.preferences as unknown as Record<string, unknown>) || {},
          loyalty_points: 0,
          referral_code: null,
          referred_by: null,
          notes: null,
          tags: [],
          is_active: true,
          is_blocked: false,
          blocked_reason: null,
          metadata: {},
        })
        .select('id')
        .single();
      
      if (profileError) {
        console.error('❌ Error creating profile:', profileError);
        return {
          success: false,
          error: profileError.message,
        };
      }
      
      profileId = newProfile.id;
      console.log('✅ Profile migrated to Supabase:', profileId);
    }
    
    // 4. Migrate conversations
    let conversationsMigrated = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(LOCAL_CONVERSATIONS_KEY_PREFIX)) continue;
      
      try {
        const conversationStr = localStorage.getItem(key);
        if (!conversationStr) continue;
        
        const localConversation = JSON.parse(conversationStr);
        
        // Check if conversation already migrated
        const conversationId = key.replace(LOCAL_CONVERSATIONS_KEY_PREFIX, '');
        const { data: existingConv } = await supabaseBrowser
          .from('conversations')
          .select('id')
          .eq('id', conversationId)
          .single();
        
        if (existingConv) {
          console.log('ℹ️ Conversation already migrated:', conversationId);
          continue;
        }
        
        // Create conversation in Supabase
        const { error: convError } = await supabaseBrowser
          .from('conversations')
          .insert({
            id: conversationId,
            user_profile_id: profileId,
            channel: 'web',
            language: localConversation.language || 'ru',
            messages: (localConversation.messages as unknown as Record<string, unknown>[]) || [],
            message_count: localConversation.messages?.length || 0,
            summary: localConversation.summary || null,
            resulted_in_order: false,
            metadata: {},
          });
        
        if (convError) {
          console.error('⚠️ Error migrating conversation:', convError);
          continue;
        }
        
        conversationsMigrated++;
        
      } catch (error) {
        console.error('⚠️ Error processing conversation:', error);
        continue;
      }
    }
    
    console.log(`✅ Migrated ${conversationsMigrated} conversations`);
    
    // 5. Mark as migrated
    markAsMigrated();
    
    return {
      success: true,
      profileId,
      conversationsMigrated,
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mark migration as completed
 */
function markAsMigrated(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(MIGRATION_KEY, new Date().toISOString());
  console.log('✅ Migration marked as completed');
}

/**
 * Clean up old localStorage data (after 30 days)
 */
export function cleanupOldLocalStorage(): void {
  if (typeof window === 'undefined') return;
  
  const migratedAt = localStorage.getItem(MIGRATION_KEY);
  if (!migratedAt) return;
  
  const daysSinceMigration = Math.floor(
    (Date.now() - new Date(migratedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceMigration < 30) {
    console.log(`ℹ️ Keeping localStorage backup (${daysSinceMigration} days old)`);
    return;
  }
  
  // Delete old profile
  localStorage.removeItem(LOCAL_PROFILE_KEY);
  
  // Delete old conversations
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LOCAL_CONVERSATIONS_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
  
  console.log('🗑️ Cleaned up old localStorage data');
}

/**
 * Force reset migration (for testing)
 */
export function resetMigration(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(MIGRATION_KEY);
  console.log('🔄 Migration reset');
}

