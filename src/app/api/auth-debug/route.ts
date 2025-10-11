import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase-client'

// Debug endpoint for auth issues - development only
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const supabase = createServiceRoleClient() as unknown as SupabaseClient<Database, 'public'>
    
    // Check if admin user exists
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to list users',
        details: usersError.message
      }, { status: 500 })
    }

    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    return NextResponse.json({
      success: true,
      authUsers: users.users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at
      })),
      profiles: profiles || [],
      profilesError: profilesError?.message || null,
      totalAuthUsers: users.users.length,
      totalProfiles: profiles?.length || 0
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Create admin user
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    
    // Create user with admin role
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm email in development
    })

    if (authError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create auth user',
        details: authError.message
      }, { status: 500 })
    }

    // Create profile with admin role
    const payload = {
      id: authUser.user.id as string,
      email: String(email),
      role: 'admin'
    } as unknown as import('@/lib/supabase-client').Database['public']['Tables']['profiles']['Insert']

    const { data: profile, error: profileError } = await (supabase as unknown as SupabaseClient<Database>)
      .from('profiles')
      .insert([payload] as Database['public']['Tables']['profiles']['Insert'][])
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // User was created but profile failed - that's ok, we can fix it later
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: authUser.user.id,
        email: authUser.user.email
      },
      profile: profile,
      profileError: profileError?.message || null
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
