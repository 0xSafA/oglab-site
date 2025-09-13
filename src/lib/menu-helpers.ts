import type { MenuRow } from './google';

/* ------------------------------------------------------------------
   Which columns to display for each product category
   ------------------------------------------------------------------*/
export const columnsPerCategory: Record<
  string,
  { label: string; keys: (keyof MenuRow)[] }
> = {
  'TOP SHELF': { label: 'THC', keys: ['THC', 'Price_5g', 'Price_20g'] },
  'MID SHELF': { label: 'THC', keys: ['THC', 'Price_5g', 'Price_20g'] },
  PREMIUM: { label: 'THC', keys: ['THC', 'Price_5g', 'Price_20g'] },
  SMALLS: { label: 'THC', keys: ['THC', 'Price_5g', 'Price_20g'] },
  CBG: { label: 'CBG', keys: ['CBG', 'Price_5g', 'Price_20g'] },
  'PRE ROLLS': { label: '', keys: ['Price_1pc'] },
  'FRESH FROZEN HASH': { label: '', keys: ['Price_1g', 'Price_5g'] },
  'LIVE HASH ROSIN': { label: '', keys: ['Price_1g', 'Price_5g'] },
  'DRY SIFT HASH': { label: '', keys: ['Price_1g', 'Price_5g'] },
  'ICE BUBBLE HASH': { label: '', keys: ['Price_1g', 'Price_5g'] },
};

/* ------------------------------------------------------------------
   Default layout order for displaying category blocks in three columns
   ------------------------------------------------------------------*/
export const layoutOrder: string[][] = [
  ['TOP SHELF', 'MID SHELF'],
  ['PREMIUM', 'SMALLS', 'CBG', 'PRE ROLLS'],
  ['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH'],
];

/* ------------------------------------------------------------------
   Group rows from Google Sheet by category (key = Category).
   If Category field is empty — put in "UNSORTED".
   ------------------------------------------------------------------*/
export function groupRows(rows: MenuRow[]) {
  const byCat: Record<string, MenuRow[]> = {};
  for (const r of rows) {
    const key = r.Category?.trim() || 'UNSORTED';
    (byCat[key] ??= []).push(r);
  }
  return byCat;
}
