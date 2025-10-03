import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from './supabase-client'

export interface DynamicSettings {
  id: string
  created_at: string
  updated_at: string
  event_text: string
  offer_text: string
  offer_hide: boolean
  offer_enable_particles: boolean
  offer_enable_cosmic_glow: boolean
  offer_enable_floating: boolean
  offer_enable_pulse: boolean
  offer_enable_inner_light: boolean
  tier0_label: string
  tier1_label: string
  tier2_label: string
  tier3_label: string
  legend_hybrid: string
  legend_sativa: string
  legend_indica: string
  feature_label: string
  tip_label: string
}

/**
 * Fetches dynamic settings from Supabase (server-side with service role)
 * Used only in /menu page - doesn't block homepage
 */
export async function fetchDynamicSettings(): Promise<DynamicSettings | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return null
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
    
    const { data, error } = await supabase
      .from('dynamic_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching dynamic settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in fetchDynamicSettings:', error)
    return null
  }
}

/**
 * Fetches dynamic settings from Supabase (client-side)
 * Used for async loading on homepage without blocking render
 */
export async function fetchDynamicSettingsClient(): Promise<DynamicSettings | null> {
  try {
    const supabase = createClientComponentClient()
    
    const { data, error } = await supabase
      .from('dynamic_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching dynamic settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in fetchDynamicSettingsClient:', error)
    return null
  }
}

/**
 * Updates dynamic settings in Supabase
 */
export async function updateDynamicSettings(
  id: string,
  updates: Partial<Omit<DynamicSettings, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClientComponentClient()
    
    const { error } = await supabase
      .from('dynamic_settings')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating dynamic settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in updateDynamicSettings:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

