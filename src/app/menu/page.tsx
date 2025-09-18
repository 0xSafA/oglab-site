import Image from 'next/image';
import Link from 'next/link';
import { fetchMenuWithOptions, type MenuRow } from '@/lib/google';
import { groupRows, columnsPerCategory } from '@/lib/menu-helpers';
import PacmanTrail from '@/components/PacmanTrail';
import AutoRefresh from '@/components/AutoRefresh';
import BreathingController from '@/components/BreathingController';
import PotController from '@/components/PotController';
import PotManager from '@/components/PotManager';
import FitToViewport from '@/components/FitToViewport';


// Type colors mapping
const typeColor = {
  hybrid: '#4f7bff',
  hybride: '#4f7bff',
  sativa: '#ff6633',
  indica: '#38b24f',
} as const;

type KnownType = keyof typeof typeColor;

const getTypeKey = (row: MenuRow): KnownType | null => {
  const raw = row.Type?.toLowerCase();
  if (!raw) return null;
  if (raw === 'hybride') return 'hybrid';
  return (Object.keys(typeColor) as KnownType[]).includes(raw as KnownType) ? (raw as KnownType) : null;
};

export default async function MenuPage() {
  const { rows, layout } = await fetchMenuWithOptions();
  const grouped = groupRows(rows);

  return (
    <div className="viewport-page bg-gradient-to-br from-[#536C4A] to-[#B0BF93]">
      <div id="menu-viewport-container" className="viewport-container viewport-menu bg-white/95 shadow-2xl border-2 border-[#B0BF93]/30">
          
          {/* Menu Flex Layout */}
          <section className="viewport-menu-layout">
            {/* Column 1 */}
            <div className="viewport-column">
              {layout.column1.map((category) => (
                <CategoryBlock key={category} name={category} rows={grouped[category] ?? []} />
              ))}

              {/* Legend footer - compact and responsive, flows with column 1 */}
              <footer className="viewport-footer bg-white/95 shadow-2xl border border-[#B0BF93]/30">
                <div className="grid grid-cols-3 items-center">
                  {/* Column 1 - Logo and Menu */}
                  <div className="flex flex-col md:flex-row lg:flex-row items-center gap-1 md:gap-1 lg:gap-1">
                    <div className="relative">
                      <Link href="/" aria-label="Go to home">
                        <Image
                          src="/assets/images/oglab_logo_round.svg"
                          alt="OG Lab Logo"
                          width={32}
                          height={32}
                          className="footer-logo animate-pulse-slow rounded-full shadow-md"
                        />
                      </Link>
                    </div>
                    <span className="font-bold tracking-wide uppercase text-[#536C4A] text-xs md:text-xs lg:text-xs">
                      Menu
                    </span>
                  </div>
                  
                  {/* Column 2 - Legend */}
                  <div className="space-y-0.5 md:space-y-0 lg:space-y-0 text-xs md:text-xs lg:text-xs">
                    <LegendDot type="hybrid" label="Hybrid" />
                    <LegendDot type="sativa" label="Sativa" />
                    <LegendDot type="indica" label="Indica" />
                  </div>
                  
                  {/* Column 3 - Farm-grown and Batches info */}
                  <div className="space-y-1 md:space-y-0.5 lg:space-y-0.5">
                    <div className="flex items-center gap-2 md:gap-1 lg:gap-1">
                      <svg className="farm-leaf" viewBox="0 0 24 24" fill="#536C4A">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="text-gray-700 text-sm md:text-xs lg:text-xs">Farm-grown</span>
                    </div>
                    <div>
                      <span className="text-gray-700 text-sm md:text-xs lg:text-xs">Batches from <span className="text-[#536C4A] marker-dashed font-medium">5g</span></span>
                    </div>
                  </div>
                </div>
              </footer>
            </div>

            {/* Column 2 */}
            <div className="viewport-column">
              {layout.column2.map((category) => (
                <CategoryBlock key={category} name={category} rows={grouped[category] ?? []} />
              ))}
            </div>

            {/* Column 3 */}
            <div className="viewport-column">
              {layout.column3.map((category) => (
                <CategoryBlock key={category} name={category} rows={grouped[category] ?? []} />
              ))}
            </div>
          </section>

        
        {/* Pacman Animation */}
        <PacmanTrail />
        
        {/* Auto Refresh Component */}
        <AutoRefresh />
        
        {/* Breathing Animation Controller */}
        <BreathingController />
        
        {/* TV fit helper (scale down slightly if needed) */}
        <FitToViewport targetId="menu-viewport-container" minScale={0.82} bottomSafePx={24} />

        {/* Cannabis Pot System */}
        <PotController />
        <PotManager />
      </div>
    </div>
  );
}

// Category Block Component
function CategoryBlock({ name, rows }: { name: string; rows: MenuRow[] }) {
  const conf = columnsPerCategory[name] ?? 
    (name.toUpperCase().includes('HASH')
      ? { label: '', keys: ['Price_1g', 'Price_5g'] }
      : { label: 'THC', keys: ['THC', 'Price_5g', 'Price_20g'] });

  const showTHC = rows.some((r) => r.THC);
  const priceKeys = conf.keys.filter((k) => k !== 'THC' && k !== 'CBG');

  return (
    <div className="menu-category bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      {/* Category Header */}
      <div className="menu-category-header bg-[#536C4A] text-white font-bold px-2 py-1 flex items-center justify-between text-xs uppercase tracking-wide rounded-t-xl">
        <span className="flex-1">{name}</span>
        {showTHC && <span className="w-10 text-right text-xs">THC</span>}
        {priceKeys.map((k) => (
          <span key={k} className="w-10 text-right text-xs">
            {headerLabel(k)}
          </span>
        ))}
      </div>

      {/* Category Content */}
      <div>
        {rows.map((row) => {
          const typeKey = getTypeKey(row);
          return (
            <div key={row.Name} className="menu-category-item flex items-center px-2 py-1 hover:bg-gray-50 transition-colors">
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                {(typeKey || row.Our) && <CombinedIndicator typeKey={typeKey} isOur={!!row.Our} />}
                <span className="item-name font-medium text-gray-800">{row.Name}</span>
              </div>
              
              {showTHC && (
                <div className="item-thc w-10 text-right text-gray-600">
                  {row.THC ? `${row.THC}%` : row.CBG ? `${row.CBG}%` : '-'}
                </div>
              )}
              
              {priceKeys.map((k) => (
                <div key={k} className="item-price w-10 text-right text-gray-700">
                  {row[k] ? `${row[k]}` : '-'}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
    );
  }

// Combined Indicator Component
function CombinedIndicator({ typeKey, isOur }: { typeKey: KnownType | null; isOur?: boolean }) {
  const hasCheckmark = !!isOur;
  const colorClass = typeKey ? `dot-${typeKey}` : 'dot-default';

  return (
    <div className="relative flex items-center justify-center w-3 h-3">
      <div className={`w-3 h-3 rounded-full ${colorClass}`} />
      {hasCheckmark && (
        <svg
          className="absolute w-2 h-2 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      )}
    </div>
  );
}

// Legend Dot Component
function LegendDot({ type, label }: { type: KnownType; label: string }) {
  const dotClass = `dot-${type}`;

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-full ${dotClass}`} />
      <span className="text-xs">{label}</span>
    </div>
  );
}

// Header label helper
const headerLabel = (k: string) => ({
  Price_1pc: '1PC',
  Price_1g: '1G+',
  Price_5g: '5G+',
  Price_20g: '20G+',
}[k] ?? k);

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 900; // Revalidate every 15 minutes
