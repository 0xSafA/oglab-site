import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Helper function to process private key
function processPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  
  // Handle different formats of private key
  let processedKey = key;
  
  // Replace escaped newlines
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

// Try to read from file first, then fall back to environment variable
let privateKey: string | undefined;

try {
  privateKey = fs.readFileSync(
    path.resolve(process.cwd(), 'service-key.pem'),
    'utf-8'
  );
} catch {
  console.log('Service key file not found, using environment variable');
  privateKey = processPrivateKey(process.env.GS_PRIVATE_KEY);
}

// Initialize Google Sheets API with better error handling
function createGoogleSheetsClient() {
  try {
    if (!process.env.GS_CLIENT_EMAIL || !privateKey) {
      console.warn('Google Sheets credentials not properly configured');
      return null;
    }

    const auth = new google.auth.JWT({
      email: process.env.GS_CLIENT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Failed to create Google Sheets client:', error);
    return null;
  }
}

const sheets = createGoogleSheetsClient();

/* ───────────── типы ───────────── */
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

/* ───────────── layout + PackmanTrail ───────────── */
export async function fetchMenuWithOptions(): Promise<{
  rows: MenuRow[];
  layout: MenuLayout;
  packmanText: string;
}> {
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
  }

  console.log('[DEBUG] rows:', Array.isArray(rows), rows?.length);
  console.log('[DEBUG] layout:', layout);
  console.log('[DEBUG] packmanText:', packmanText);

  return { rows, layout, packmanText };
}

/* ───────────── основное меню ───────────── */
async function fetchRows(): Promise<MenuRow[]> {
  if (!sheets) {
    throw new Error('Google Sheets client not initialized');
  }

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GS_SHEET_ID!,
    range: 'A1:Z',
    valueRenderOption: 'UNFORMATTED_VALUE',
  });

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
}

/* ───────────── утилиты ───────────── */
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