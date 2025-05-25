// shop/lib/google.ts
import { google } from 'googleapis';

export interface MenuRow {
  Category: string;
  Name: string;
  THC?: string;
  CBG?: string;
  Price_1pc?: string;
  Price_1g?: string;
  Price_5g?: string;
  Price_20g?: string;
  Tag?: string;
  Our?: string;
}

const auth = new google.auth.JWT(
  process.env.GS_CLIENT_EMAIL,
  undefined,
  process.env.GS_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets.readonly']
);

const sheets = google.sheets({ version: 'v4', auth });

export async function fetchMenu(): Promise<MenuRow[]> {
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GS_SHEET_ID!,
    range: 'A1:Z',
    valueRenderOption: 'UNFORMATTED_VALUE',
  });

  const [header, ...rows] = data.values as string[][];

  return rows.map((r) =>
    header.reduce<MenuRow>((acc, key, i) => {
      acc[key as keyof MenuRow] = r[i];
      return acc;
    }, {} as MenuRow)
  );
}