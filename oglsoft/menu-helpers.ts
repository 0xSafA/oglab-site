// shop/lib/menu-helpers.ts
import { MenuRow } from './google';

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
  PIATELLA: { label: '', keys: ['Price_1g', 'Price_5g'] },
};

export const layoutOrder = [
  ['TOP SHELF', 'MID SHELF'],
  ['PREMIUM', 'SMALLS', 'CBG', 'PRE ROLLS', 'PIATELLA'],
  ['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH'],
];

export function groupRows(rows: MenuRow[]) {
  const byCat: Record<string, MenuRow[]> = {};
  for (const r of rows) {
    if (!byCat[r.Category]) byCat[r.Category] = [];
    byCat[r.Category].push(r);
  }
  return byCat;
}