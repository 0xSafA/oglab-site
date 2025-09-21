import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client for Server Components
export const createServerComponentClient = async () => {
  const cookieStore = await cookies()
  
  // Debug: Log all cookies
  const allCookies = cookieStore.getAll()
  console.log('🔐 Server cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
  
  // Debug: Log Supabase-specific cookies
  const supabaseCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-'))
  console.log('🔐 Supabase cookies:', supabaseCookies.map(c => ({ 
    name: c.name, 
    valueLength: c.value?.length || 0,
    valuePreview: c.value?.substring(0, 50) + '...' 
  })))
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Helper to check if user has admin role (for menu access)
export const checkWeedMenuRole = async (userId: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (error || !profile) {
    return false
  }
  
  return profile.role === 'admin'
}

// Helper to check if user has admin role (for migration and sensitive operations)
export const checkAdminRole = async (userId: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (error || !profile) {
    return false
  }
  
  return profile.role === 'admin'
}

