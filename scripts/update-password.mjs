import { createClient } from '@supabase/supabase-js'
import { config as loadEnv } from 'dotenv'

// Load local env for Node script
loadEnv({ path: '.env.local' })

// Usage: node scripts/update-password.mjs <email> <newPassword>
const [,, emailArg, passwordArg] = process.argv

if (!emailArg || !passwordArg) {
  console.error('Usage: node scripts/update-password.mjs <email> <newPassword>')
  process.exit(1)
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false }
})

try {
  // Try to find userId via admin.listUsers (reliable)
  let userId = null
  let page = 1
  const perPage = 1000
  // Loop a few pages just in case
  for (; page <= 5 && !userId; page += 1) {
    const { data: listData, error: listError } = await admin.auth.admin.listUsers({ page, perPage })
    if (listError) {
      console.warn('listUsers error (page', page, '):', listError.message)
      break
    }
    const found = listData?.users?.find(u => (u.email || '').toLowerCase() === emailArg.toLowerCase())
    if (found) userId = found.id
    if (!listData?.users?.length) break
  }

  // Fallback: try profiles table by email
  if (!userId) {
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id')
      .eq('email', emailArg)
      .maybeSingle?.() ?? { data: null, error: null }

    if (profile?.id) userId = profile.id
    if (profileError) console.warn('profiles fallback error:', profileError.message)
  }

  if (!userId) {
    console.error('User not found for email:', emailArg)
    process.exit(1)
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    password: passwordArg
  })

  if (updateError) {
    console.error('Password update failed:', updateError.message)
    process.exit(1)
  }

  console.log('Password updated successfully for', emailArg)
  process.exit(0)
} catch (e) {
  console.error('Unexpected error:', e?.message || e)
  process.exit(1)
}


