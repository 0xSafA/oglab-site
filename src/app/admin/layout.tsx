import { createServerComponentClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { debugLog } from '@/lib/debug-logger'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerComponentClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Debug logging to file and console
  debugLog('Admin Layout - User check', { 
    user: user?.email || 'None', 
    error: error?.message || 'None',
    userId: user?.id || 'None'
  })
  
  if (!user) {
    debugLog('Admin Layout - No user, redirecting to login')
    redirect('/auth/login?redirectTo=/admin')
  }

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/auth/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
