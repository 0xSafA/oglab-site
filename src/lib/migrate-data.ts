import { createServiceRoleClient } from './supabase-client'
import { fetchMenuWithOptions } from './google'
type MenuItem = {
  id: string
  category: string
  name: string
  type: string | null
  thc: number | null
  cbg: number | null
  price_1pc: number | null
  price_1g: number | null
  price_5g: number | null
  price_20g: number | null
  our: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

/**
 * Migrates data from Google Sheets to Supabase
 * This should be run once to populate the initial data
 */
export async function migrateFromGoogleSheets() {
  console.log('Starting migration from Google Sheets to Supabase...')
  
  const supabase = createServiceRoleClient()
  
  try {
    // Fetch data from Google Sheets
    const { rows, layout } = await fetchMenuWithOptions()
    
    console.log(`Found ${rows.length} menu items to migrate`)
    
    // Clear existing data (optional - remove if you want to preserve existing data)
    await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // Transform and insert menu items
    const menuItems: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'updated_by'>[] = rows
      .filter(row => row.Name && row.Category)
      .map(row => ({
        category: row.Category!,
        name: row.Name!,
        type: normalizeType(row.Type),
        thc: row.THC || null,
        cbg: row.CBG || null,
        price_1pc: row.Price_1pc || null,
        price_1g: row.Price_1g || null,
        price_5g: row.Price_5g || null,
        price_20g: row.Price_20g || null,
        our: row.Our || false,
      }))
    
    // Insert menu items in batches
    const batchSize = 100
    for (let i = 0; i < menuItems.length; i += batchSize) {
      const batch = menuItems.slice(i, i + batchSize)
      const { error } = await supabase
        .from('menu_items')
        .insert(batch)
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
        throw error
      }
      
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(menuItems.length / batchSize)}`)
    }
    
    // Update menu layout
    // Ensure we have a layout row id (create if missing)
    const existingLayout = await supabase.from('menu_layout').select('id').single();
    const layoutId = existingLayout.data?.id || '00000000-0000-0000-0000-000000000000';
    const { error: layoutError } = await supabase
      .from('menu_layout')
      .update({
        column1: layout.column1,
        column2: layout.column2,
        column3: layout.column3,
      })
      .eq('id', String(layoutId))
    
    if (layoutError) {
      console.error('Error updating menu layout:', layoutError)
      throw layoutError
    }
    
    console.log('Migration completed successfully!')
    
    return {
      success: true,
      itemsCount: menuItems.length,
      message: `Successfully migrated ${menuItems.length} menu items`
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Migration failed'
    }
  }
}

/**
 * Normalizes cannabis type from Google Sheets format
 */
function normalizeType(type: string | null | undefined): 'hybrid' | 'sativa' | 'indica' | null {
  if (!type) return null
  
  const normalized = type.toLowerCase().trim()
  
  if (normalized === 'hybride') return 'hybrid'
  if (['hybrid', 'sativa', 'indica'].includes(normalized)) {
    return normalized as 'hybrid' | 'sativa' | 'indica'
  }
  
  return null
}

/**
 * Fetches current data from Supabase for comparison
 */
export async function getSupabaseData() {
  const supabase = createServiceRoleClient()
  
  const [menuItems, menuLayout, theme] = await Promise.all([
    supabase.from('menu_items').select('*').order('category, name'),
    supabase.from('menu_layout').select('*').single(),
    supabase.from('theme').select('*').single()
  ])
  
  return {
    menuItems: menuItems.data || [],
    menuLayout: menuLayout.data,
    theme: theme.data,
    errors: {
      menuItems: menuItems.error,
      menuLayout: menuLayout.error,
      theme: theme.error
    }
  }
}

/**
 * Validates the migration by comparing counts and structure
 */
export async function validateMigration() {
  try {
    const [googleData, supabaseData] = await Promise.all([
      fetchMenuWithOptions(),
      getSupabaseData()
    ])
    
    const googleItemsCount = googleData.rows.filter(row => row.Name && row.Category).length
    const supabaseItemsCount = supabaseData.menuItems.length
    
    const validation = {
      googleItemsCount,
      supabaseItemsCount,
      countMatch: googleItemsCount === supabaseItemsCount,
      layoutMatch: JSON.stringify(googleData.layout) === JSON.stringify({
        column1: supabaseData.menuLayout?.column1 || [],
        column2: supabaseData.menuLayout?.column2 || [],
        column3: supabaseData.menuLayout?.column3 || []
      }),
      errors: supabaseData.errors
    }
    
    console.log('Migration validation:', validation)
    return validation
    
  } catch (error) {
    console.error('Validation failed:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
