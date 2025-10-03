'use client'

import Image from 'next/image'
import { useMemo } from 'react'

type Props = {
  url: string
  title: string
  duration?: string
  large?: boolean
}

export default function VideoTile({ url, title, duration, large }: Props) {
  const thumb = useMemo(() => {
    const idMatch = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/)
    const id = idMatch?.[1] || ''
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
  }, [url])

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`group relative block overflow-hidden rounded-2xl border border-white/40 bg-white/60 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${large ? 'h-64 md:h-80' : 'h-48'}`}
    >
      {thumb ? (
        <Image src={thumb} alt={title} fill className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <h3 className="line-clamp-2 text-base font-semibold text-white drop-shadow">{title}</h3>
        {duration && (
          <span className="ml-3 shrink-0 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white">{duration}</span>
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#2F3A24] shadow-xl transition-transform group-hover:scale-105">▶</span>
      </div>
    </a>
  )
}


