import Image from 'next/image';
import { fetchMenuWithOptions, type MenuRow } from '@/lib/google';
import { groupRows, columnsPerCategory } from '@/lib/menu-helpers';
import PacmanTrail from '@/components/PacmanTrail';
import AutoRefresh from '@/components/AutoRefresh';
import BreathingController from '@/components/BreathingController';
import PotController from '@/components/PotController';
import PotManager from '@/components/PotManager';


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
    <div className="min-h-screen bg-gradient-to-br from-[#536C4A] to-[#B0BF93] menu-safe-area">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#536C4A] via-[#B0BF93] to-[#536C4A]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(176,191,147,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(83,108,74,0.3)_0%,transparent_50%),radial-gradient(circle_at_40%_60%,rgba(176,191,147,0.2)_0%,transparent_50%)]"></div>
      </div>

      <main className="relative w-full z-10">
        <div className="menu-main-container menu-container bg-white/95 backdrop-blur-lg shadow-2xl border-2 border-[#B0BF93]/30 p-3 md:p-4 lg:p-5 w-full animate-fade-in-up">
          

          {/* Menu Grid */}
          <section className="menu-grid grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-2 lg:gap-3 mb-3 md:mb-2 mt-2 md:mt-1 w-full">
            {/* Column 1 */}
            <div className="space-y-3 md:space-y-2 lg:space-y-2">
              {layout.column1.map((category) => (
                <CategoryBlock key={category} name={category} rows={grouped[category] ?? []} />
              ))}
            </div>

            {/* Column 2 */}
            <div className="space-y-3 md:space-y-2 lg:space-y-2">
              {layout.column2.map((category) => (
                <CategoryBlock key={category} name={category} rows={grouped[category] ?? []} />
              ))}
            </div>

            {/* Column 3 */}
            <div className="space-y-3 md:space-y-2 lg:space-y-2">
              {layout.column3.map((category) => (
                <CategoryBlock key={category} name={category} rows={grouped[category] ?? []} />
              ))}
            </div>
          </section>

          {/* Legend footer - positioned relative to content, not screen */}
          <footer className="mt-4 md:mt-6 lg:mt-8 bg-white/95 backdrop-blur-sm rounded-xl p-3 md:p-4 text-xs text-gray-700 shadow-2xl border border-[#B0BF93]/30 w-full md:w-2/3 lg:w-auto lg:max-w-[calc(50%-1rem)]">
            <div className="grid grid-cols-3 gap-2 md:gap-2 lg:gap-1 items-center">
              {/* Column 1 - Logo and Menu */}
              <div className="flex flex-col md:flex-row lg:flex-row items-center gap-1 md:gap-1 lg:gap-1">
                <div className="relative">
                  <Image
                    src="/assets/images/oglab_logo_round.svg"
                    alt="OG Lab Logo"
                    width={28}
                    height={28}
                    className="animate-pulse-slow rounded-full shadow-md md:w-7 md:h-7 lg:w-6 lg:h-6"
                  />
                </div>
                <span className="font-bold tracking-wide uppercase text-[#536C4A] text-xs md:text-xs lg:text-xs">
                  Menu
                </span>
              </div>
              
              {/* Column 2 - Legend */}
              <div className="space-y-0.5 md:space-y-0 lg:space-y-0 text-xs md:text-xs lg:text-xs">
                <LegendDot color={typeColor.hybrid} label="Hybrid" />
                <LegendDot color={typeColor.sativa} label="Sativa" />
                <LegendDot color={typeColor.indica} label="Indica" />
              </div>
              
              {/* Column 3 - Farm-grown and Batches info */}
              <div className="space-y-1 md:space-y-0.5 lg:space-y-0.5">
                <div className="flex items-center gap-2 md:gap-1 lg:gap-1">
                  <svg className="farm-leaf w-4 h-4 md:w-3 md:h-3 lg:w-3 lg:h-3" viewBox="0 0 24 24" fill="#536C4A">
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

        {/* Pacman Animation */}
        <PacmanTrail />
        
        {/* Auto Refresh Component */}
        <AutoRefresh />
        
        {/* Breathing Animation Controller */}
        <BreathingController />
        
        {/* Cannabis Pot System */}
        <PotController />
        <PotManager />
      </main>
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
    <div className="menu-category bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      {/* Category Header */}
      <div className="menu-category-header bg-[#536C4A] text-white font-bold px-2 py-1 flex items-center justify-between text-xs uppercase tracking-wide">
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
                <span className="font-medium text-gray-800 text-sm">{row.Name}</span>
              </div>
              
              {showTHC && (
                <div className="w-10 text-right text-xs text-gray-600">
                  {row.THC ? `${row.THC}%` : row.CBG ? `${row.CBG}%` : '-'}
                </div>
              )}
              
              {priceKeys.map((k) => (
                <div key={k} className="w-10 text-right text-xs text-gray-700">
                  {row[k] ? `${row[k]}฿` : '-'}
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
  const baseColor = typeKey ? typeColor[typeKey] : '#536C4A';
  const hasCheckmark = !!isOur;
  
  // Добавляем CSS класс для анимации дыхания
  const breathingClass = typeKey ? `dot-${typeKey}` : '';
  
  return (
    <div className="relative flex items-center justify-center w-2.5 h-2.5">
      {/* Main circle */}
      <div
        className={`w-2.5 h-2.5 rounded-full ${breathingClass}`}
        style={{ backgroundColor: baseColor }}
      />
      
      {/* Checkmark for "our" products */}
      {hasCheckmark && (
        <svg 
          className="absolute w-1.5 h-1.5 text-white" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      )}
    </div>
  );
}

// Legend Dot Component
function LegendDot({ color, label }: { color: string; label: string }) {
  // Определяем CSS класс для анимации дыхания на основе цвета
  const getBreathingClass = (color: string) => {
    if (color === typeColor.hybrid) return 'dot-hybrid';
    if (color === typeColor.sativa) return 'dot-sativa';
    if (color === typeColor.indica) return 'dot-indica';
    return '';
  };
  
  const breathingClass = getBreathingClass(color);
  
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-2.5 h-2.5 rounded-full ${breathingClass}`}
        style={{ backgroundColor: color }}
      />
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
