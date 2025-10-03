import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-client'

// Reset admin password - development only
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email, newPassword } = body

    if (!email || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Email and newPassword are required'
      }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    
    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to list users',
        details: listError.message
      }, { status: 500 })
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: `User with email ${email} not found`
      }, { status: 404 })
    }

    // Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update password',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Password updated successfully for ${email}`,
      userId: user.id
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
