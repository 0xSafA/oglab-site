import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { fetchMenuWithOptions, type MenuRow } from '@/lib/supabase-data';
import { getMenuThemeConfig } from '@/lib/theme-config';
import { fetchDynamicSettings } from '@/lib/dynamic-settings';

import { groupRows, columnsPerCategory } from '@/lib/menu-helpers';
import PacmanTrail from '@/components/PacmanTrail';
import AutoRefresh from '@/components/AutoRefresh';
import BreathingController from '@/components/BreathingController';
import PotController from '@/components/PotController';
import PotManager from '@/components/PotManager';


// Type colors mapping
const typeColor = (theme: ReturnType<typeof getMenuThemeConfig>) => ({
  hybrid: theme.legend_hybrid_color,
  hybride: theme.legend_hybrid_color,
  sativa: theme.legend_sativa_color,
  indica: theme.legend_indica_color,
} as const);

type KnownType = 'hybrid' | 'sativa' | 'indica';

const getTypeKey = (row: MenuRow): KnownType | null => {
  const raw = row.Type?.toLowerCase();
  if (!raw) return null;
  if (raw === 'hybride') return 'hybrid';
  return (['hybrid','sativa','indica'] as KnownType[]).includes(raw as KnownType) ? (raw as KnownType) : null;
};

export default async function MenuPage() {
  const [{ rows, layout }, dynamicSettings] = await Promise.all([
    fetchMenuWithOptions(),
    fetchDynamicSettings()
  ]);
  const grouped = groupRows(rows);

  // Get static theme from environment variables
  const theme = getMenuThemeConfig();
  
  const primaryColor = theme.primary_color;
  const secondaryColor = theme.secondary_color;
  const logoUrl = '/assets/images/oglab_logo.png';
  const itemTextColor = theme.item_text_color;
  const categoryTextColor = theme.category_text_color;
  const cardBgColor = theme.card_bg_color;
  const colors = typeColor(theme);
  const featureColor = theme.feature_color;

  // Get dynamic labels from database (with fallbacks)
  const tierLabels: Record<string, string> = {
    Price_1pc: dynamicSettings?.tier0_label || '1PC',
    Price_1g: dynamicSettings?.tier1_label || '1G',
    Price_5g: dynamicSettings?.tier2_label || '5G+',
    Price_20g: dynamicSettings?.tier3_label || '20G+',
  };

  const hiddenSet = new Set(layout.hidden || [])

  return (
    <div 
      className="viewport-page bg-gradient-to-br"
      style={{ 
        background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` 
      }}
    >
      <div
        id="menu-viewport-container"
        className="viewport-container viewport-menu shadow-2xl border-2 border-[#B0BF93]/30"
        style={{ ['--menu-card-bg' as unknown as string]: cardBgColor }}
      >
          
          {/* Menu Flex Layout */}
          <section className="viewport-menu-layout">
            {/* Column 1 */}
            <div className="viewport-column">
              {layout.column1.filter((c) => !hiddenSet.has(c)).map((category) => (
                <CategoryBlock key={category} name={category} rows={grouped[category] ?? []} primaryColor={primaryColor} tierLabels={tierLabels} itemTextColor={itemTextColor} categoryTextColor={categoryTextColor} cardBgColor={cardBgColor} typeColors={colors} featureColor={featureColor} />
              ))}

              {/* Legend footer - compact and responsive, flows with column 1 */}
              <footer className="viewport-footer bg-white/95 shadow-2xl border border-[#B0BF93]/30">
                <div className="grid grid-cols-3 items-center">
                  {/* Column 1 - Logo and Menu */}
                  <div className="flex flex-col md:flex-row lg:flex-row items-center gap-1 md:gap-1 lg:gap-1">
                    <div className="relative">
                      <Link href="/" aria-label="Go to home">
                        <Image
                          src={logoUrl}
                          alt="OG Lab Logo"
                          width={32}
                          height={32}
                          className="footer-logo animate-pulse-slow rounded-full shadow-md"
                        />
                      </Link>
                    </div>
                    <span 
                      className="font-bold tracking-wide uppercase text-xs md:text-xs lg:text-xs"
                      style={{ color: primaryColor }}
                    >
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
                  <div className="space-y-1 md:space-y-0.5 lg:space-y-0.5 no-wrap">
                    <div className="flex items-center gap-2 md:gap-1 lg:gap-1">
                      <svg className="farm-leaf" viewBox="0 0 24 24" fill="#536C4A">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="text-gray-700 text-sm md:text-xs lg:text-xs">Farm-grown</span>
                    </div>
                    <div>
                      <span className="text-gray-700 text-sm md:text-xs lg:text-xs">Batches from <span className="marker-dashed font-medium" style={{ color: primaryColor }}>5g</span></span>
                    </div>
                  </div>
                </div>
              </footer>
            </div>

            {/* Column 2 */}
            <div className="viewport-column">
              {layout.column2.filter((c) => !hiddenSet.has(c)).map((category) => (
                <CategoryBlock key={category} name={category} rows={grouped[category] ?? []} primaryColor={primaryColor} tierLabels={tierLabels} itemTextColor={itemTextColor} categoryTextColor={categoryTextColor} cardBgColor={cardBgColor} typeColors={colors} featureColor={featureColor} />
              ))}
            </div>

            {/* Column 3 */}
            <div className="viewport-column">
              {layout.column3.filter((c) => !hiddenSet.has(c)).map((category) => (
                <CategoryBlock key={category} name={category} rows={grouped[category] ?? []} primaryColor={primaryColor} tierLabels={tierLabels} itemTextColor={itemTextColor} categoryTextColor={categoryTextColor} cardBgColor={cardBgColor} typeColors={colors} featureColor={featureColor} />
              ))}
            </div>
          </section>

        
        {/* Pacman Animation */}
        <PacmanTrail />
        
        {/* Auto Refresh Component */}
        <AutoRefresh />
        
        {/* Breathing Animation Controller */}
        <BreathingController />
        
        {/* Cannabis Pot System */}
        <PotController />
        <PotManager />
      </div>
    </div>
  );
}

// Category Block Component - мемоизирован для производительности на ТВ
const CategoryBlock = memo(function CategoryBlock({ name, rows, primaryColor, tierLabels, itemTextColor, categoryTextColor, cardBgColor, typeColors, featureColor }: { name: string; rows: MenuRow[]; primaryColor?: string; tierLabels: Record<string, string>; itemTextColor: string; categoryTextColor: string; cardBgColor: string; typeColors: Record<string,string>; featureColor: string }) {
  const conf = columnsPerCategory[name] ?? 
    (name.toUpperCase().includes('HASH')
      ? { label: '', keys: ['Price_1g', 'Price_5g'] }
      : { label: 'THC', keys: ['THC', 'Price_5g', 'Price_20g'] });

  const showTHC = rows.some((r) => r.THC);
  const priceKeys = conf.keys.filter((k) => k !== 'THC' && k !== 'CBG');

  return (
    <div className="menu-category rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300" style={{ backgroundColor: cardBgColor }}>
      {/* Category Header */}
      <div 
        className="menu-category-header font-bold px-2 py-1 flex items-center justify-between text-xs uppercase tracking-wide rounded-t-xl"
        style={{ backgroundColor: primaryColor || '#536C4A', color: categoryTextColor }}
      >
        <span className="flex-1">{name}</span>
        {showTHC && <span className="w-10 text-right text-xs">THC</span>}
        {priceKeys.map((k) => (
          <span key={k} className="w-10 text-right text-xs">
            {headerLabel(k, tierLabels)}
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
                {(typeKey || row.Our) && <CombinedIndicator typeKey={typeKey} isOur={!!row.Our} colorMap={typeColors} featureColor={featureColor} />}
                <span className="item-name font-medium" style={{ color: itemTextColor }}>{row.Name}</span>
              </div>
              
              {showTHC && (
                <div className="item-thc w-10 text-right text-gray-600">
                  {row.THC ? `${row.THC}%` : row.CBG ? `${row.CBG}%` : '-'}
                </div>
              )}
              
              {priceKeys.map((k) => (
                <div key={k} className="item-price w-10 text-right text-gray-700">
                  {row[k as keyof MenuRow] ? `${row[k as keyof MenuRow]}` : ''}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Combined Indicator Component - мемоизирован для производительности
const CombinedIndicator = memo(function CombinedIndicator({ typeKey, isOur, colorMap, featureColor }: { typeKey: KnownType | null; isOur?: boolean; colorMap: Record<string,string>; featureColor: string }) {
  const hasCheckmark = !!isOur;
  const backgroundColor = typeKey ? colorMap[typeKey] : (hasCheckmark ? featureColor : '#536C4A');
  const style = { backgroundColor } as React.CSSProperties;

  return (
    <div className="relative flex items-center justify-center w-3 h-3">
      <div className="w-3 h-3 rounded-full" style={style} />
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
});

// Legend Dot Component - мемоизирован для производительности
const LegendDot = memo(function LegendDot({ type, label }: { type: KnownType; label: string }) {
  const dotClass = `dot-${type}`;

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-full ${dotClass}`} />
      <span className="text-xs">{label}</span>
    </div>
  );
});

// Header label helper
const headerLabel = (k: string, labels: Record<string, string>) => {
  const map: Record<string, string | undefined> = {
    Price_1pc: labels.Price_1pc,
    Price_1g: labels.Price_1g,
    Price_5g: labels.Price_5g,
    Price_20g: labels.Price_20g,
  }
  const fallback: Record<string, string> = {
    Price_1pc: '1PC',
    Price_1g: '1G',
    Price_5g: '5G+',
    Price_20g: '20G+',
  }
  return map[k] || fallback[k] || k
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 900; // Revalidate every 15 minutes
