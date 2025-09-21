// Temporary script to check Supabase auth configuration
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔐 Supabase URL:', supabaseUrl)
console.log('🔐 Current domain:', 'http://localhost:3001')

// Try to get auth settings (this will show allowed domains in error if any)
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConfig() {
  try {
    // This should work regardless of domain settings
    const { data, error } = await supabase.auth.getSession()
    console.log('🔐 Session check:', { hasSession: !!data.session, error: error?.message })
    
    // Try to sign in with a test (this will fail but show domain errors)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: 'invalid'
    })
    
    console.log('🔐 Sign in test error:', signInError?.message)
    
  } catch (err) {
    console.log('🔐 Config error:', err.message)
  }
}

checkConfig()
