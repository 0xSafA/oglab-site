/**
 * Supabase Client Configuration
 * Provides configured Supabase clients for browser and server
 */

import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient as createClientComponentClientBase } from '@supabase/auth-helpers-nextjs';

// Types for our database schema
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          telegram_user_id: number | null;
          telegram_username: string | null;
          created_at: string;
          first_visit: string;
          last_visit: string;
          total_conversations: number;
          total_messages: number;
          total_orders: number;
          total_spent: number;
          preferences: Record<string, unknown>;
          loyalty_points: number;
          referral_code: string | null;
          referred_by: string | null;
          notes: string | null;
          tags: string[] | null;
          is_active: boolean;
          is_blocked: boolean;
          blocked_reason: string | null;
          metadata: Record<string, unknown>;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          role: string | null;
          created_at?: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          role?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          user_profile_id: string;
          channel: string;
          language: string;
          started_at: string;
          ended_at: string | null;
          last_message_at: string;
          messages: Array<Record<string, unknown>>;
          summary: string | null;
          message_count: number;
          user_satisfaction: number | null;
          feedback: string | null;
          resulted_in_order: boolean;
          order_id: string | null;
          metadata: Record<string, unknown>;
        };
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'started_at' | 'last_message_at'>;
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_profile_id: string | null;
          conversation_id: string | null;
          assigned_to: string | null;
          status: string;
          status_history: Array<Record<string, unknown>>;
          items: Array<Record<string, unknown>>;
          subtotal: number;
          delivery_fee: number;
          discount: number;
          total_amount: number;
          currency: string;
          contact_info: Record<string, unknown>;
          delivery_address: string | null;
          delivery_notes: string | null;
          payment_method: string;
          payment_status: string;
          created_at: string;
          confirmed_at: string | null;
          estimated_delivery: string | null;
          actual_delivery: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          order_source: string;
          staff_notes: string | null;
          cancellation_reason: string | null;
          rating: number | null;
          review: string | null;
          metadata: Record<string, unknown>;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'order_number' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      agent_events: {
        Row: {
          id: string;
          user_profile_id: string | null;
          conversation_id: string | null;
          order_id: string | null;
          event_type: string;
          event_data: Record<string, unknown> | null;
          channel: string | null;
          session_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['agent_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['agent_events']['Insert']>;
      };
    };
    Functions: {
      get_today_metrics: {
        Args: Record<string, never>;
        Returns: {
          total_orders: number;
          total_revenue: number;
          total_conversations: number;
          conversion_rate: number;
          avg_order_value: number;
          new_users: number;
          returning_users: number;
        }[];
      };
      get_top_products: {
        Args: {
          days_back?: number;
          limit_count?: number;
        };
        Returns: {
          product_name: string;
          order_count: number;
          total_quantity: number;
          total_revenue: number;
        }[];
      };
    };
  };
};

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check .env.local file.'
  );
}

/**
 * Browser client - uses anon key
 * For use in Client Components
 */
export const supabaseBrowser = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Server client - uses service role key
 * For use in API routes and Server Actions
 * Has full database access (bypasses RLS)
 */
export function getSupabaseServer() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// NOTE: Server Component client moved to a separate server-only module to avoid next/headers import here.

/**
 * Client Component helper - uses auth helpers
 * For use in Client Components (with auth)
 */
export function getSupabaseClient() {
  return createClientComponentClientBase<Database>();
}

// Re-export typed helper for Client Components
export function createClientComponentClient() {
  return createClientComponentClientBase<Database>();
}

/**
 * Type exports for convenience
 */
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update'];

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export type AgentEvent = Database['public']['Tables']['agent_events']['Row'];
export type AgentEventInsert = Database['public']['Tables']['agent_events']['Insert'];

// Back-compat server client alias for service role usage in API routes
export function createServiceRoleClient() {
  return getSupabaseServer();
}

/**
 * Helper: Handle Supabase errors
 */
export function handleSupabaseError(error: unknown): never {
  console.error('Supabase error:', error);
  
  const err = error as { code?: string; message?: string };
  if (err.code === 'PGRST116') {
    throw new Error('Resource not found');
  }
  
  if (err.code === '23505') {
    throw new Error('Resource already exists');
  }
  
  throw new Error(err.message || 'Database operation failed');
}

/**
 * Helper: Check if error is "not found"
 */
export function isNotFoundError(error: unknown): boolean {
  const err = error as { code?: string } | null | undefined;
  return err?.code === 'PGRST116';
}
