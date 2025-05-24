// ───────────────────────────────────────────────────────────────
// File: app/menu/page.tsx
// Main TV menu page.  Uses Google-Sheets data (see `lib/google.ts`) and
// groups rows according to the agreed layout.
// To regenerate every 15 minutes use `export const revalidate = 900;`
// ───────────────────────────────────────────────────────────────
import Image from 'next/image';
import { fetchMenu } from '@/lib/google';
import {
  columnsPerCategory,
  groupRows,
  layoutOrder,
} from '@/lib/menu-helpers';
import clsx from 'clsx';

export const revalidate = 120; // ISR – rebuild every 2 min

export default async function MenuPage() {
  const data = await fetchMenu();
  const grouped = groupRows(data);

  return (
    <main className="w-full max-w-6xl px-4 md:px-0 py-2 flex flex-col gap-4">
      {/*  Logo + title  */}
      <header className="flex items-center justify-center gap-3 text-[#536C4A]">
        <Image src="/logo-og-lab.svg" alt="OG Lab" width={72} height={32} />
        <h1 className="text-3xl font-semibold tracking-wide">MENU</h1>
      </header>

      {/* three-column grid */}
      <section
        className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4"
        /* rightmost divider */
        style={{
          position: 'relative',
        }}
      >
        {layoutOrder.map((colCats, colIdx) => (
          <div
            key={colIdx}
            className={clsx('space-y-6', colIdx === 2 && 'md:pl-6')}
          >
            {colCats.map((cat) => (
              <CategoryBlock key={cat} name={cat} rows={grouped[cat] ?? []} />
            ))}
          </div>
        ))}

        {/* vertical divider only on desktop */}
        <span
          className="hidden md:block absolute left-2/3 top-0 h-full w-[3px]"
          style={{ backgroundColor: '#b0bf93' }}
        />
      </section>

      {/* footer legend */}
      <footer className="flex flex-wrap justify-between items-center text-xs mt-2 gap-2">
        <LegendDot color="#4f7bff" label="Hybrid" />
        <LegendDot color="#ff6633" label="Dominant Sativa" />
        <LegendDot color="#38b24f" label="Dominant Indica" />
        <LegendDot color="#536C4A" label="Our farm-grown" isLeaf />
        <span className="px-2 py-1 border rounded border-[#536C4A] text-[#536C4A]">
          Minimum order 5 G
        </span>
        <span className="ml-auto text-right md:text-left">
          Ask your budtender about a Dab Session
        </span>
      </footer>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────
// Helpers/components
// ───────────────────────────────────────────────────────────────
function CategoryBlock({
  name,
  rows,
}: {
  name: string;
  rows: any[];
}) {
  const conf =
    columnsPerCategory[name] ?? (name.toUpperCase().includes('HASH')
      ? { label: '', keys: ['Price_1g', 'Price_5g'] }
      : { label: 'THC', keys: ['THC', 'Price_5g', 'Price_20g'] });

  return (
    <div className="space-y-1">
      {/* header plaque */}
      <div
        className="text-white font-semibold tracking-wide px-3 py-1 uppercase text-sm"
        style={{ backgroundColor: '#536C4A' }}
      >
        {name}
      </div>

      {/* table */}
      <table className="w-full text-sm">
        {/* column headings */}
        <thead>
          <tr className="text-xs uppercase text-[#536C4A]">
            {conf.label && <th className="text-left py-0.5">{conf.label}</th>}
            {conf.keys.filter((k) => k !== 'THC' && k !== 'CBG').map((k) => (
              <th key={k} className="text-right py-0.5">
                {headerLabel(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.Name} className="align-top">
              <td className="py-0.5 pr-1 whitespace-nowrap">
                {/* optional icon */}
                {r.Tag === 'our' && (
                  <span
                    className="inline-block w-2 h-2 mr-1"
                    style={{
                      backgroundImage: 'url(/icons/leaf.svg)',
                      backgroundSize: 'contain',
                    }}
                  />
                )}
                {r.Name}
              </td>

              {conf.keys.filter((k) => k !== 'THC' && k !== 'CBG').map((k) => (
                <td key={k} className="py-0.5 text-right">
                  {r[k] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function headerLabel(key: string) {
  return (
    {
      Price_1pc: '1PC',
      Price_1g: '1G',
      Price_5g: '5G+',
      Price_20g: '20G+',
    } as Record<string, string>
  )[key] ?? key;
}

function LegendDot({
  color,
  label,
  isLeaf,
}: {
  color: string;
  label: string;
  isLeaf?: boolean;
}) {
  return (
    <span className="flex items-center gap-1 mr-2">
      {isLeaf ? (
        <Image src="/icons/leaf.svg" alt="leaf" width={10} height={10} />
      ) : (
        <span
          className="inline-block w-[10px] h-[10px] rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </span>
  );
}