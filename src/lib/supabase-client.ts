import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Database types
export interface MenuItem {
  id: string
  category: string
  name: string
  type?: string | null
  thc?: number | null
  cbg?: number | null
  price_1pc?: number | null
  price_1g?: number | null
  price_5g?: number | null
  price_20g?: number | null
  our?: boolean | null
  created_at: string
  updated_at: string
  updated_by?: string | null
}

export interface MenuLayout {
  id: string
  column1: string[]
  column2: string[]
  column3: string[]
  updated_at: string
}

export interface Theme {
  id: string
  primary_color: string
  secondary_color: string
  logo_url?: string | null
  tier0_label?: string | null
  tier1_label?: string | null
  tier2_label?: string | null
  tier3_label?: string | null
  legend_hybrid?: string | null
  legend_sativa?: string | null
  legend_indica?: string | null
  feature_label?: string | null
  tip_label?: string | null
  legend_hybrid_color?: string | null
  legend_sativa_color?: string | null
  legend_indica_color?: string | null
  feature_color?: string | null
  item_text_color?: string | null
  category_text_color?: string | null
  card_bg_color?: string | null
  event_text?: string | null
  offer_text?: string | null
  offer_enable_particles?: boolean | null
  offer_enable_cosmic_glow?: boolean | null
  offer_enable_floating?: boolean | null
  offer_enable_pulse?: boolean | null
  offer_enable_inner_light?: boolean | null
  updated_at: string
}

// Singleton client instance to avoid multiple GoTrueClient instances
let supabaseClientInstance: ReturnType<typeof createBrowserClient> | null = null

// Client-side Supabase client (safe to import in client components)
export const createClientComponentClient = () => {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        cookies: {
          getAll() {
            if (typeof document === 'undefined') return []
            const raw = document.cookie || ''
            if (!raw) return []
            return raw.split('; ').filter(Boolean).map((pair) => {
              const eq = pair.indexOf('=')
              const name = eq >= 0 ? pair.slice(0, eq) : pair
              const value = eq >= 0 ? decodeURIComponent(pair.slice(eq + 1)) : ''
              return { name, value }
            })
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: { path?: string; maxAge?: number; expires?: string | number | Date; domain?: string; sameSite?: boolean | 'lax' | 'strict' | 'none'; secure?: boolean } }>) {
            if (typeof document === 'undefined') return
            cookiesToSet.forEach(({ name, value, options }) => {
              let cookie = `${name}=${value}`
              cookie += `; Path=${options?.path ?? '/'}`
              if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`
              if (options?.expires) cookie += `; Expires=${new Date(options.expires).toUTCString()}`
              if (options?.domain) cookie += `; Domain=${options.domain}`
              if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`
              if (options?.secure) cookie += `; Secure`
              document.cookie = cookie
            })
          },
        },
      }
    )
  }
  return supabaseClientInstance
}

// Service role client (for admin operations - can be used in both client and server)
export const createServiceRoleClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
