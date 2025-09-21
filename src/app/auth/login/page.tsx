'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase-client'
import Link from 'next/link'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin'
  
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Get form data directly from form elements (more resistant to extensions)
    const formData = new FormData(e.target as HTMLFormElement)
    const formEmail = formData.get('email') as string
    const formPassword = formData.get('password') as string

      // Persistent logging to file and console
      const logData = {
        timestamp: new Date().toISOString(),
        action: 'form_submitted',
        stateEmail: email,
        formEmail: formEmail,
        finalEmail: formEmail || email,
        redirectTo: redirectTo,
        hasSupabaseClient: !!supabase,
        supabaseUrl: supabase?.supabaseUrl
      }
      
      console.log('🔐 LOGIN ATTEMPT:', logData)
      
      // Also save to localStorage for persistence
      try {
        const existingLogs = JSON.parse(localStorage.getItem('auth_debug_logs') || '[]')
        existingLogs.push(logData)
        localStorage.setItem('auth_debug_logs', JSON.stringify(existingLogs.slice(-10))) // Keep last 10
      } catch (storageError) {
        console.log('🔐 Storage error:', storageError)
      }

    // Use form data if state is empty (extension interference)
    const finalEmail = formEmail || email
    const finalPassword = formPassword || password

    if (!finalEmail || !finalPassword) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password: finalPassword,
      })

      console.log('🔐 Login response:', { data: !!data.user, error: error?.message })

      if (error) {
        try {
          console.error('🔐 Login error:', error)
        } catch (logError) {
          // Fallback if console is blocked
          alert(`Login error: ${error.message}`)
        }
        setError(`Login failed: ${error.message}`)
        return
      }

      if (data.user) {
        console.log('🔐 Login successful, user:', data.user.email)
        
        // Also log to file and check cookies
        if (typeof window !== 'undefined') {
          localStorage.setItem('debug_login_success', JSON.stringify({
            timestamp: new Date().toISOString(),
            user: data.user.email,
            userId: data.user.id
          }))
          
          // Log all cookies after login
          console.log('🔐 Client cookies after login:', document.cookie)
          localStorage.setItem('debug_cookies_after_login', document.cookie)
        }
        
        // Check user profile/role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        
        console.log('🔐 User profile:', { profile, profileError })
        
        if (profileError) {
          setError(`Profile error: ${profileError.message}`)
          return
        }
        
        if (!profile || profile.role !== 'admin') {
          setError(`Access denied: User role is '${profile?.role}', but 'admin' is required`)
          return
        }
        
        console.log('🔐 Redirecting to:', redirectTo)
        // Force page reload to ensure session is recognized by middleware
        window.location.replace(redirectTo)
      } else {
        setError('Login failed: No user data received')
      }
    } catch (err) {
      console.error('🔐 Unexpected error:', err)
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#536C4A] to-[#B0BF93] flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-[#B0BF93]/30 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#536C4A] mb-2">Admin Login</h1>
          <p className="text-gray-600">Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {loading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              🔐 Logging in... Please wait
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent transition-colors"
              placeholder="admin@oglab.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#536C4A] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#536C4A]/90 focus:ring-2 focus:ring-[#536C4A] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            href="/"
            className="text-[#536C4A] hover:text-[#536C4A]/80 text-sm font-medium"
          >
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
