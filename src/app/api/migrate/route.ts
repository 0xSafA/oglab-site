import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'
import { migrateFromGoogleSheets, validateMigration } from '@/lib/migrate-data'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'migrate') {
      const result = await migrateFromGoogleSheets()
      return NextResponse.json(result)
    } else if (action === 'validate') {
      const result = await validateMigration()
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Migration API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    )
  }
}
