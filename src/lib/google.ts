import { google } from 'googleapis';

// Helper function to process private key
function processPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  
  // Handle different formats of private key
  let processedKey = key.trim();
  
  // Remove quotes if present
  if (processedKey.startsWith('"') && processedKey.endsWith('"')) {
    processedKey = processedKey.slice(1, -1);
  }
  if (processedKey.startsWith("'") && processedKey.endsWith("'")) {
    processedKey = processedKey.slice(1, -1);
  }
  
  // Replace escaped newlines with actual newlines
  processedKey = processedKey.replace(/\\\\n/g, '\n');
  processedKey = processedKey.replace(/\\n/g, '\n');
  
  // Remove trailing backslashes that break PEM format
  processedKey = processedKey.replace(/\\\s*$/gm, '');
  processedKey = processedKey.replace(/\\$/gm, '');
  
  // Ensure proper PEM format
  if (!processedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    // If it's just the key content without headers, add them
    processedKey = `-----BEGIN PRIVATE KEY-----\n${processedKey}\n-----END PRIVATE KEY-----`;
  }
  
  // Ensure proper line endings and clean up
  processedKey = processedKey.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Remove any trailing whitespace from each line
  processedKey = processedKey.split('\n').map(line => line.trim()).join('\n');
  
  // Validate the key format
  if (!processedKey.includes('-----BEGIN PRIVATE KEY-----') || 
      !processedKey.includes('-----END PRIVATE KEY-----')) {
    console.error('Invalid private key format. Key should be in PEM format.');
    return undefined;
  }
  
  return processedKey;
}

// Initialize Google Sheets API with better error handling
function createGoogleSheetsClient() {
  try {
    const processedKey = processPrivateKey(process.env.GS_PRIVATE_KEY);
    
    if (!process.env.GS_CLIENT_EMAIL || !processedKey) {
      console.warn('Google Sheets credentials not properly configured');
      return null;
    }

    const auth = new google.auth.JWT({
      email: process.env.GS_CLIENT_EMAIL,
      key: processedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Failed to create Google Sheets client:', error);
    return null;
  }
}

const sheets = createGoogleSheetsClient();

/* ───────────── Types ───────────── */
export interface MenuRow {
  Category: string | null;
  Name: string | null;
  THC?: number | null;
  CBG?: number | null;
  Price_1pc?: number | null;
  Price_1g?: number | null;
  Price_5g?: number | null;
  Price_20g?: number | null;
  Type?: string | null;
  Our?: boolean | null;
  PackmanTrail?: string | null;
}

export interface MenuLayout {
  column1: string[];
  column2: string[];
  column3: string[];
}

/* ───────────── Layout + PackmanTrail ───────────── */
export async function fetchMenuWithOptions(): Promise<{
  rows: MenuRow[];
  layout: MenuLayout;
  packmanText: string;
}> {
  try {
    // Test authentication first
    if (!process.env.GS_CLIENT_EMAIL || !process.env.GS_PRIVATE_KEY) {
      console.warn('Missing Google Sheets credentials in environment variables - using fallback data');
      return getFallbackData();
    }

    // Debug information
    console.log('Google Sheets credentials found:');
    console.log('- Client email:', process.env.GS_CLIENT_EMAIL ? 'Present' : 'Missing');
    console.log('- Private key:', process.env.GS_PRIVATE_KEY ? `Present (${process.env.GS_PRIVATE_KEY.length} chars)` : 'Missing');
    console.log('- Sheet ID:', process.env.GS_SHEET_ID ? 'Present' : 'Missing');
    
    const processedKey = processPrivateKey(process.env.GS_PRIVATE_KEY);
    if (!processedKey) {
      console.error('Failed to process private key - using fallback data');
      return getFallbackData();
    }

    const rows = (await fetchRows()) ?? [];

    const layout: MenuLayout = {
      column1: [],
      column2: [],
      column3: [],
    };

    let packmanText = '';

    try {
      if (!sheets) {
        throw new Error('Google Sheets client not initialized');
      }

      const { data } = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GS_SHEET_ID!,
        range: 'Options!A2:C100',
        valueRenderOption: 'UNFORMATTED_VALUE',
      });

      if (data?.values) {
        data.values.forEach((row, idx) => {
          const col = String(row[0] ?? '').trim();
          const categories = String(row[1] ?? '')
            .split(',')
            .map((s) => s.trim());

          if (col === '1') layout.column1 = categories;
          if (col === '2') layout.column2 = categories;
          if (col === '3') layout.column3 = categories;

          if (idx === 0 && row[2]) packmanText = String(row[2]);
        });

        if (
          !layout.column1.length ||
          !layout.column2.length ||
          !layout.column3.length
        ) {
          console.warn(
            '⚠️ Warning: Layout columns are empty! Check Options sheet data or parsing logic.'
          );
        }
      }
    } catch (e) {
      console.warn('Options sheet fetch failed', e);
      // Fallback layout
      layout.column1 = ['TOP SHELF', 'MID SHELF'];
      layout.column2 = ['PREMIUM', 'SMALLS', 'CBG', 'PRE ROLLS'];
      layout.column3 = ['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH'];
    }

    console.log('[DEBUG] rows:', Array.isArray(rows), rows?.length);
    console.log('[DEBUG] layout:', layout);
    console.log('[DEBUG] packmanText:', packmanText);

    return { rows, layout, packmanText };
  } catch (error) {
    console.error('Error fetching menu data:', error);
    
    // Return fallback data instead of throwing error
    return getFallbackData();
  }
}

/* ───────────── Fallback data function ───────────── */
function getFallbackData() {
  return {
    rows: [
      {
        Category: 'TOP SHELF',
        Name: 'OG Kush',
        THC: 25,
        Price_5g: 1500,
        Price_20g: 5000,
        Type: 'hybrid',
        Our: true,
      },
      {
        Category: 'TOP SHELF',
        Name: 'White Widow',
        THC: 23,
        Price_5g: 1400,
        Price_20g: 4800,
        Type: 'sativa',
        Our: false,
      },
      {
        Category: 'MID SHELF',
        Name: 'Blue Dream',
        THC: 20,
        Price_5g: 1200,
        Price_20g: 4000,
        Type: 'hybrid',
        Our: true,
      },
      {
        Category: 'PREMIUM',
        Name: 'Gorilla Glue',
        THC: 28,
        Price_5g: 1800,
        Price_20g: 6000,
        Type: 'indica',
        Our: false,
      },
      {
        Category: 'SMALLS',
        Name: 'Purple Haze',
        THC: 18,
        Price_5g: 1000,
        Price_20g: 3500,
        Type: 'sativa',
        Our: true,
      },
      {
        Category: 'FRESH FROZEN HASH',
        Name: 'Bubble Hash Special',
        THC: 45,
        Price_1g: 800,
        Price_5g: 3500,
        Type: 'hybrid',
        Our: true,
      },
      {
        Category: 'LIVE HASH ROSIN',
        Name: 'Premium Rosin',
        THC: 65,
        Price_1g: 1200,
        Price_5g: 5000,
        Type: 'indica',
        Our: true,
      }
    ] as MenuRow[],
    layout: {
      column1: ['TOP SHELF', 'MID SHELF'],
      column2: ['PREMIUM', 'SMALLS', 'CBG', 'PRE ROLLS'],
      column3: ['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH'],
    },
    packmanText: 'Welcome to OG Lab Menu! 🌿 (Demo Mode - Configure Google Sheets for live data)'
  };
}

/* ───────────── Main menu fetch ───────────── */
async function fetchRows(): Promise<MenuRow[]> {
  try {
    if (!sheets) {
      throw new Error('Google Sheets client not initialized');
    }

    if (!process.env.GS_SHEET_ID) {
      throw new Error('Google Sheets ID not configured');
    }

    let data;
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GS_SHEET_ID,
        range: 'A1:Z',
        valueRenderOption: 'UNFORMATTED_VALUE',
      });
      data = response.data;
    } catch (error) {
      console.error('Failed to fetch from Google Sheets:', error);
      console.log('Falling back to mock data due to network/API error');
      
      // Fallback to empty array if Google Sheets is unreachable
      return [];
    }

    const values = data.values;
    if (!values || !Array.isArray(values)) return [];

    const [header, ...rows] = values as [string[], ...unknown[][]];

    return rows
      .map((r) => {
        const item: Partial<MenuRow> = {};

        header.forEach((key, i) => {
          const k = key.trim();
          const v = r[i];

          switch (k) {
            case 'Our':
              item.Our = orNull(parseBoolean(v));
              break;
            case 'THC':
            case 'CBG':
            case 'Price_1pc':
            case 'Price_1g':
            case 'Price_5g':
            case 'Price_20g':
              item[k as keyof MenuRow] = orNull(parseNumber(v)) as never;
              break;
            case 'Category':
            case 'Name':
            case 'Type':
            case 'PackmanTrail':
              item[k as keyof MenuRow] = String(v ?? '').trim() as never;
              break;
          }
        });

        return item as MenuRow;
      })
      .filter((row) => row.Name && row.Category);
  } catch (error) {
    console.error('Error fetching rows from Google Sheets:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    throw error;
  }
}

/* ───────────── Utilities ───────────── */
function orNull<T>(v: T | undefined): T | null {
  return v === undefined ? null : v;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'string') {
    const v = value.trim().toUpperCase();
    if (v === 'TRUE') return true;
    if (v === 'FALSE') return false;
  }
  if (typeof value === 'boolean') return value;
  return undefined;
}

function parseNumber(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(n) ? undefined : n;
}
