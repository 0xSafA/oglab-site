import { createClientComponentClient } from './supabase-client'
import { createServerComponentClient } from './supabase-server'
import type { Theme } from './supabase-client'

// Legacy interface for compatibility with existing code
export interface MenuRow {
  Category: string | null
  Name: string | null
  THC?: number | null
  CBG?: number | null
  Price_1pc?: number | null
  Price_1g?: number | null
  Price_5g?: number | null
  Price_20g?: number | null
  Type?: string | null
  Our?: boolean | null
}

export interface MenuData {
  rows: MenuRow[]
  layout: {
    column1: string[]
    column2: string[]
    column3: string[]
    hidden?: string[]
  }
  packmanText: string
}

export type { Theme }

/**
 * Fetches menu data from Supabase (server-side)
 */
export async function fetchMenuWithOptions(): Promise<MenuData> {
  try {
    const supabase = await createServerComponentClient()
    
    const [menuItemsResult, menuLayoutResult] = await Promise.all([
      supabase.from('menu_items').select('*').order('category, name'),
      supabase.from('menu_layout').select('*').order('updated_at', { ascending: false }).limit(1).single(),
    ])

    if (menuItemsResult.error) {
      console.error('Error fetching menu items:', menuItemsResult.error)
      throw menuItemsResult.error
    }

    if (menuLayoutResult.error) {
      console.error('Error fetching menu layout:', menuLayoutResult.error)
      throw menuLayoutResult.error
    }

    // Transform Supabase data to legacy format for compatibility
    const rows: MenuRow[] = (menuItemsResult.data || []).map(item => ({
      Category: item.category,
      Name: item.name,
      THC: item.thc,
      CBG: item.cbg,
      Price_1pc: item.price_1pc,
      Price_1g: item.price_1g,
      Price_5g: item.price_5g,
      Price_20g: item.price_20g,
      Type: item.type,
      Our: item.our,
    }))

    const layout = {
      column1: menuLayoutResult.data?.column1 || [],
      column2: menuLayoutResult.data?.column2 || [],
      column3: menuLayoutResult.data?.column3 || [],
      hidden: menuLayoutResult.data?.hidden || []
    }

    // Get packman text from theme or use default
    const packmanText = "Welcome to OG Lab - Premium Cannabis Experience"

    return {
      rows,
      layout,
      packmanText
    }

  } catch (error) {
    console.error('Error in fetchMenuWithOptions:', error)
    
    // Return fallback data in case of error
    return {
      rows: [],
      layout: {
        column1: ['TOP SHELF', 'MID SHELF', 'PREMIUM'],
        column2: ['SMALLS', 'CBG', 'PRE ROLLS'],
        column3: ['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH'],
        hidden: []
      },
      packmanText: "Welcome to OG Lab - Premium Cannabis Experience"
    }
  }
}

/**
 * Fetches menu data from Supabase (client-side)
 */
export async function fetchMenuWithOptionsClient(): Promise<MenuData> {
  try {
    const supabase = createClientComponentClient()
    
    const [menuItemsResult, menuLayoutResult] = await Promise.all([
      supabase.from('menu_items').select('*').order('category, name'),
      supabase.from('menu_layout').select('*').single()
    ])

    if (menuItemsResult.error) {
      console.error('Error fetching menu items:', menuItemsResult.error)
      throw menuItemsResult.error
    }

    if (menuLayoutResult.error) {
      console.error('Error fetching menu layout:', menuLayoutResult.error)
      throw menuLayoutResult.error
    }

    // Transform Supabase data to legacy format for compatibility
    type SupabaseMenuItem = {
      category: string
      name: string
      thc?: number | null
      cbg?: number | null
      price_1pc?: number | null
      price_1g?: number | null
      price_5g?: number | null
      price_20g?: number | null
      type?: string | null
      our?: boolean | null
    }

    const rows: MenuRow[] = ((menuItemsResult.data as SupabaseMenuItem[]) || []).map((item: SupabaseMenuItem) => ({
      Category: item.category,
      Name: item.name,
      THC: item.thc,
      CBG: item.cbg,
      Price_1pc: item.price_1pc,
      Price_1g: item.price_1g,
      Price_5g: item.price_5g,
      Price_20g: item.price_20g,
      Type: item.type,
      Our: item.our,
    }))

    type MenuLayoutRow = { column1?: string[]; column2?: string[]; column3?: string[]; hidden?: string[] }

    const layout = {
      column1: menuLayoutResult.data?.column1 || [],
      column2: menuLayoutResult.data?.column2 || [],
      column3: menuLayoutResult.data?.column3 || [],
      hidden: (menuLayoutResult.data as MenuLayoutRow)?.hidden || []
    }

    const packmanText = "Welcome to OG Lab - Premium Cannabis Experience"

    return {
      rows,
      layout,
      packmanText
    }

  } catch (error) {
    console.error('Error in fetchMenuWithOptionsClient:', error)
    
    // Return fallback data in case of error
    return {
      rows: [],
      layout: {
        column1: ['TOP SHELF', 'MID SHELF', 'PREMIUM'],
        column2: ['SMALLS', 'CBG', 'PRE ROLLS'],
        column3: ['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH'],
        hidden: []
      },
      packmanText: "Welcome to OG Lab - Premium Cannabis Experience"
    }
  }
}

/**
 * Fetches theme data from Supabase
 */
export async function fetchTheme(): Promise<Theme | null> {
  try {
    const supabase = await createServerComponentClient()
    
    const { data, error } = await supabase
      .from('theme')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching theme:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in fetchTheme:', error)
    return null
  }
}

/**
 * Fetches theme data from Supabase (client-side)
 */
export async function fetchThemeClient(): Promise<Theme | null> {
  try {
    const supabase = createClientComponentClient()
    
    const { data, error } = await supabase
      .from('theme')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching theme:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in fetchThemeClient:', error)
    return null
  }
}
