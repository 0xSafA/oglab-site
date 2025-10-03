'use client'

import Link from 'next/link'

type Item = {
  key: string
  title: string
  image: string
}

const items: Item[] = [
  { key: 'seedlings', title: 'Seedlings', image: '/assets/bts/seeding.png' },
  { key: 'watering', title: 'Watering', image: '/assets/bts/watering.png' },
  { key: 'trimming', title: 'Trimming', image: '/assets/bts/trimming.png' },
  { key: 'testing', title: 'Testing', image: '/assets/bts/testing.png' },
  { key: 'packaging', title: 'Packaging', image: '/assets/bts/packaging.png' },
  { key: 'dispensary', title: 'Dispensary', image: '/assets/bts/dispensary.png' },
  { key: 'events', title: 'Events', image: '/assets/bts/events.png' },
  { key: 'community', title: 'Community', image: '/assets/bts/events.png' },
]

export default function BehindTheScenes() {
  return (
    <section className="mb-6">
      <div className="mb-4 text-center">
        <h3 className="text-2xl md:text-3xl font-semibold text-[#536C4A]/80 bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">Behind The Scenes</h3>
        <p className="mt-2 text-[#536C4A]/60">From seed to harvest — witness our dedication to quality at every step</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it, idx) => (
          <Link
            href="/news"
            key={it.key}
            className="group relative h-40 md:h-48 overflow-hidden rounded-2xl ring-1 ring-[#B0BF93]/30 shadow-lg hover:shadow-2xl transition-all duration-500"
            style={{
              backgroundImage: `url(${it.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#EEF6E6',
            }}
          >
            {/* Blur effect that disappears on hover */}
            <div className="absolute inset-0 backdrop-blur-sm group-hover:backdrop-blur-none transition-all duration-500" />
            
            {/* Soft gradient overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent group-hover:from-black/20 group-hover:via-black/2 transition-all duration-500" />
            
            {/* Subtle border glow on hover */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-[#B0BF93]/60 transition-all duration-500" />
            
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300">{it.title}</div>
              </div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 group-hover:bg-white text-[#536C4A] shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}


