'use client'

import Image from 'next/image'

type Props = {
  url: string
  title: string
  subtitle?: string
}

export default function HeroVideo({ url, title, subtitle }: Props) {
  const idMatch = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/)
  const videoId = idMatch?.[1] || ''
  const thumb = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : ''

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group relative block overflow-hidden rounded-3xl bg-black/10 ring-1 ring-[#B0BF93]/40 shadow-2xl"
      aria-label={`Watch: ${title}`}
    >
      {thumb && (
        <Image src={thumb} alt={title} width={1280} height={720} className="h-[56vw] max-h-[520px] w-full object-cover md:h-[420px]" priority />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute left-6 bottom-6 right-6 md:left-10 md:bottom-10 md:right-10">
        <div className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
          OG Lab Aftermovie
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white md:text-4xl drop-shadow">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-white/85 drop-shadow-md">{subtitle}</p>}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#2F3A24] shadow-xl transition-transform group-hover:scale-105">▶</span>
      </div>
    </a>
  )
}


