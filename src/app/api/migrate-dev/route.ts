import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-client'

// This is a development-only endpoint for easy migration
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    console.log('🚀 Starting menu data migration...')
    
    const supabase = createServiceRoleClient()
    
    // Sample menu data
    const sampleMenuItems = [
      {
        category: 'TOP SHELF',
        name: 'OG Kush',
        type: 'hybrid',
        thc: 22.5,
        price_1g: 800,
        price_5g: 3500,
        price_20g: 12000,
        our: true
      },
      {
        category: 'TOP SHELF', 
        name: 'White Widow',
        type: 'hybrid',
        thc: 20.0,
        price_1g: 750,
        price_5g: 3200,
        price_20g: 11000,
        our: true
      },
      {
        category: 'MID SHELF',
        name: 'Blue Dream',
        type: 'sativa',
        thc: 18.5,
        price_1g: 600,
        price_5g: 2800,
        price_20g: 9500,
        our: false
      },
      {
        category: 'PREMIUM',
        name: 'Girl Scout Cookies',
        type: 'indica',
        thc: 25.0,
        price_1g: 900,
        price_5g: 4000,
        price_20g: 14000,
        our: true
      },
      {
        category: 'SMALLS',
        name: 'Lemon Haze',
        type: 'sativa',
        thc: 16.0,
        price_1g: 400,
        price_5g: 1800,
        price_20g: 6500,
        our: false
      },
      {
        category: 'FRESH FROZEN HASH',
        name: 'Bubble Hash Premium',
        type: 'hybrid',
        thc: 45.0,
        price_1g: 1500,
        price_5g: 7000,
        our: true
      },
      {
        category: 'PRE ROLLS',
        name: 'Mixed Strain Pre-Roll',
        type: 'hybrid',
        thc: 20.0,
        price_1pc: 250,
        our: true
      },
      {
        category: 'CBG',
        name: 'CBG Flower',
        type: 'hybrid',
        cbg: 15.0,
        price_1g: 700,
        price_5g: 3000,
        our: true
      }
    ]

    // Clear existing menu items
    console.log('🗑️ Clearing existing menu items...')
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (deleteError) {
      console.error('Error clearing menu items:', deleteError)
    }

    // Insert sample menu items
    const { data: insertedItems, error: insertError } = await supabase
      .from('menu_items')
      .insert(sampleMenuItems)
      .select()

    if (insertError) {
      console.error('❌ Error inserting menu items:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: insertError.message 
      }, { status: 500 })
    }

    console.log(`✅ Successfully inserted ${insertedItems.length} menu items`)

    // Check and update menu layout if needed
    console.log('📋 Checking menu layout...')
    const { data: layouts, error: layoutError } = await supabase
      .from('menu_layout')
      .select('*')

    if (layoutError) {
      console.error('Error checking menu layout:', layoutError)
    } else if (!layouts || layouts.length === 0) {
      console.log('📋 Creating default menu layout...')
      const { error: layoutInsertError } = await supabase
        .from('menu_layout')
        .insert({
          column1: ['TOP SHELF', 'MID SHELF', 'PREMIUM'],
          column2: ['SMALLS', 'CBG', 'PRE ROLLS'],
          column3: ['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH']
        })

      if (layoutInsertError) {
        console.error('Error creating menu layout:', layoutInsertError)
      } else {
        console.log('✅ Menu layout created successfully')
      }
    } else {
      console.log(`✅ Menu layout exists (${layouts.length} entries)`)
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      itemsInserted: insertedItems.length,
      layoutExists: layouts && layouts.length > 0
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
