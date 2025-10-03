'use client'

import { useState, useEffect } from 'react'
import { fetchDynamicSettingsClient } from '@/lib/dynamic-settings'

interface DynamicOfferBannerProps {
  primaryColor: string
  secondaryColor: string
  animations: string
  enableParticles: boolean
  enableInnerLight: boolean
}

export default function DynamicOfferBanner({
  primaryColor,
  secondaryColor,
  animations,
  enableParticles,
  enableInnerLight
}: DynamicOfferBannerProps) {
  const [offerText, setOfferText] = useState('')
  const [eventText, setEventText] = useState('')
  const [isHidden, setIsHidden] = useState(true) // Start hidden by default
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load dynamic settings asynchronously
    fetchDynamicSettingsClient().then(settings => {
      if (settings) {
        setOfferText(settings.offer_text)
        setEventText(settings.event_text)
        setIsHidden(settings.offer_hide)
      } else {
        // Fallback: hide by default if no settings
        setIsHidden(true)
      }
      setIsLoading(false)
    })
  }, [])

  // Don't render anything while loading or if hidden
  if (isLoading || isHidden) return null

  return (
    <div
      className="relative overflow-hidden rounded-3xl border-2 border-[#B0BF93]/30 p-8 text-center shadow-xl transition-all hover:shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}25 100%)`,
        animation: animations || undefined,
      }}
    >
      {/* Particles */}
      {enableParticles && (
        <>
          <div
            className="absolute left-[10%] top-[20%] h-2 w-2 animate-css-particle rounded-full opacity-40"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="absolute right-[15%] top-[30%] h-1.5 w-1.5 animate-css-particle rounded-full opacity-30"
            style={{ backgroundColor: secondaryColor, animationDelay: '1s' }}
          />
          <div
            className="absolute bottom-[25%] left-[20%] h-1 w-1 animate-css-particle rounded-full opacity-35"
            style={{ backgroundColor: primaryColor, animationDelay: '2s' }}
          />
          <div
            className="absolute bottom-[30%] right-[25%] h-2 w-2 animate-css-particle rounded-full opacity-40"
            style={{ backgroundColor: secondaryColor, animationDelay: '0.5s' }}
          />
        </>
      )}

      {/* Inner light glow */}
      {enableInnerLight && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: primaryColor }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        <h2
          className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: primaryColor }}
        >
          {offerText}
        </h2>
        <p
          className="text-lg md:text-xl"
          style={{ color: `${primaryColor}CC` }}
        >
          {eventText}
        </p>
      </div>
    </div>
  )
}

