import { NextResponse } from 'next/server'
import { fetchMenuWithOptions } from '@/lib/google'

// This endpoint fetches data from Google Sheets and generates SQL insert script
export async function GET() {
  try {
    console.log('🔍 Fetching data from Google Sheets...')
    
    // Fetch data from Google Sheets
    const { rows, layout } = await fetchMenuWithOptions()
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No data found in Google Sheets. Please check your credentials and sheet configuration.',
        rows: [],
        layout: layout
      })
    }

    console.log(`📊 Found ${rows.length} items in Google Sheets`)
    
    // Generate SQL INSERT statements
    const sqlStatements: string[] = []
    
    // Add menu items
    rows.forEach((row) => {
      if (!row.Name || !row.Category) return
      
      const values = [
        `'${row.Category.replace(/'/g, "''")}'`, // category
        `'${row.Name.replace(/'/g, "''")}'`, // name
        row.Type ? `'${row.Type.replace(/'/g, "''")}'` : 'NULL', // type
        row.THC ? row.THC.toString() : 'NULL', // thc
        row.CBG ? row.CBG.toString() : 'NULL', // cbg
        row.Price_1pc ? row.Price_1pc.toString() : 'NULL', // price_1pc
        row.Price_1g ? row.Price_1g.toString() : 'NULL', // price_1g
        row.Price_5g ? row.Price_5g.toString() : 'NULL', // price_5g
        row.Price_20g ? row.Price_20g.toString() : 'NULL', // price_20g
        row.Our ? 'TRUE' : 'FALSE', // our
        'NOW()', // created_at
        'NOW()' // updated_at
      ]
      
      const sql = `INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES (${values.join(', ')});`
      sqlStatements.push(sql)
    })
    
    // Add menu layout if it has data
    if (layout.column1.length > 0 || layout.column2.length > 0 || layout.column3.length > 0) {
      const layoutSql = `
-- Update menu layout (replace existing)
DELETE FROM menu_layout;
INSERT INTO menu_layout (column1, column2, column3, created_at, updated_at) VALUES (
  ARRAY[${layout.column1.map(cat => `'${cat.replace(/'/g, "''")}'`).join(', ')}],
  ARRAY[${layout.column2.map(cat => `'${cat.replace(/'/g, "''")}'`).join(', ')}],
  ARRAY[${layout.column3.map(cat => `'${cat.replace(/'/g, "''")}'`).join(', ')}],
  NOW(),
  NOW()
);`
      sqlStatements.push(layoutSql)
    }
    
    const fullSql = `-- OG Lab Menu Data Migration
-- Generated from Google Sheets on ${new Date().toISOString()}
-- Total items: ${rows.length}

BEGIN;

${sqlStatements.join('\n\n')}

COMMIT;`

    return NextResponse.json({
      success: true,
      message: `Successfully fetched ${rows.length} items from Google Sheets`,
      itemCount: rows.length,
      layout: layout,
      sqlScript: fullSql,
      items: rows.map(row => ({
        category: row.Category,
        name: row.Name,
        type: row.Type,
        thc: row.THC,
        cbg: row.CBG,
        prices: {
          '1pc': row.Price_1pc,
          '1g': row.Price_1g,
          '5g': row.Price_5g,
          '20g': row.Price_20g
        },
        our: row.Our
      }))
    })

  } catch (error) {
    console.error('❌ Error fetching Google Sheets data:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch data from Google Sheets. Please check your credentials and configuration.'
    }, { status: 500 })
  }
}
