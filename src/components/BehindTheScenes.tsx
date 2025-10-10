'use client'

import { Link } from '@/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

type Item = {
  key: string
  titleKey: string
  image: string
}

const items: Item[] = [
  { key: 'growing', titleKey: 'btsGrowing', image: '/assets/bts/growing.png' },
  { key: 'trimming', titleKey: 'btsTrimming', image: '/assets/bts/trimming.png' },
  { key: 'testing', titleKey: 'btsTesting', image: '/assets/bts/testing.jpg' },
  { key: 'dispensary', titleKey: 'btsDispensary', image: '/assets/bts/dispensary.png' },
  { key: 'events', titleKey: 'btsEvents', image: '/assets/bts/events.png' },
  { key: 'community', titleKey: 'btsCommunity', image: '/assets/bts/community.jpg' },
]

export default function BehindTheScenes() {
  const t = useTranslations('HomePage')
  
  return (
    <section className="mt-8 mb-6">
      <div className="mb-8 text-center">
        <h3 className="text-2xl md:text-3xl font-semibold text-[#536C4A]/80 bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">{t('btsTitle')}</h3>
        <p className="mt-2 text-[#536C4A]/60">{t('btsDescription')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((it) => (
          <Link
            href="/feed"
            key={it.key}
            className="group relative h-32 md:h-40 overflow-hidden rounded-2xl ring-1 ring-[#B0BF93]/20 shadow-md hover:shadow-xl transition-all duration-500"
          >
            <Image 
              src={it.image}
              alt={t(it.titleKey)}
              fill
              loading="lazy"
              className="object-cover"
            />
            
            {/* Blur effect that disappears on hover */}
            <div className="absolute inset-0 backdrop-blur-[2px] group-hover:backdrop-blur-none transition-all duration-500" />
            
            {/* Light overlay to brighten the image */}
            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/10 transition-all duration-500" />
            
            {/* Soft gradient overlays - much lighter */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_60%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#536C4A]/20 via-transparent to-transparent group-hover:from-[#536C4A]/10 transition-all duration-500" />
            
            {/* Subtle border glow on hover */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-[#B0BF93]/50 transition-all duration-500" />
            
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div>
                <div className="text-white text-xs md:text-sm font-semibold drop-shadow-lg bg-[#536C4A]/70 px-2 py-1 rounded-lg backdrop-blur-sm">{t(it.titleKey)}</div>
              </div>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 group-hover:bg-white text-[#536C4A] shadow-md group-hover:scale-110 transition-all duration-300 text-sm">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}


