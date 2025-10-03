'use client'

import { useState, useEffect } from 'react'
import { fetchDynamicSettingsClient } from '@/lib/dynamic-settings'

interface DynamicOfferBannerProps {
  primaryColor: string
  secondaryColor: string
}

export default function DynamicOfferBanner({
  primaryColor,
  secondaryColor,
}: DynamicOfferBannerProps) {
  const [offerText, setOfferText] = useState('')
  const [isHidden, setIsHidden] = useState(true) // Start hidden by default
  const [isLoading, setIsLoading] = useState(true)
  const [enableParticles, setEnableParticles] = useState(true)
  const [enableCosmicGlow, setEnableCosmicGlow] = useState(true)
  const [enableFloating, setEnableFloating] = useState(true)
  const [enablePulse, setEnablePulse] = useState(true)
  const [enableInnerLight, setEnableInnerLight] = useState(true)

  useEffect(() => {
    // Load dynamic settings asynchronously
    fetchDynamicSettingsClient().then(settings => {
      if (settings) {
        setOfferText(settings.offer_text)
        setIsHidden(settings.offer_hide)
        setEnableParticles(settings.offer_enable_particles ?? true)
        setEnableCosmicGlow(settings.offer_enable_cosmic_glow ?? true)
        setEnableFloating(settings.offer_enable_floating ?? true)
        setEnablePulse(settings.offer_enable_pulse ?? true)
        setEnableInnerLight(settings.offer_enable_inner_light ?? true)
      } else {
        // Fallback: hide by default if no settings
        setIsHidden(true)
      }
      setIsLoading(false)
    })
  }, [])

  // Don't render anything while loading or if hidden
  if (isLoading || isHidden) return null

  // Build animation string based on settings
  const animations = [
    enableCosmicGlow && 'cosmicGlow 4s ease-in-out infinite',
    enableFloating && 'floating 6s ease-in-out infinite',
    enablePulse && 'magicPulse 4s ease-in-out infinite'
  ].filter(Boolean).join(', ')

  return (
    <div className="relative">
      <div
        className="relative overflow-visible rounded-full px-6 py-2 text-center shadow-lg transition-all hover:shadow-xl"
        style={{
          background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
          animation: animations || undefined,
        }}
      >
        {/* Content */}
        <div className="relative z-10">
          <h2
            className="text-base md:text-lg font-semibold tracking-wide text-white"
          >
            {offerText}
          </h2>
        </div>
      </div>

      {/* Particles - outside the main container so they can overflow */}
      {enableParticles && (
        <>
          <div
            className="absolute left-[5%] top-[10%] h-3 w-3 animate-css-particle rounded-full opacity-70 shadow-lg"
            style={{ 
              backgroundColor: '#FFD700',
              boxShadow: '0 0 10px #FFD700'
            }}
          />
          <div
            className="absolute right-[10%] top-[20%] h-2.5 w-2.5 animate-css-particle rounded-full opacity-60 shadow-lg"
            style={{ 
              backgroundColor: '#FF1493',
              animationDelay: '1s',
              boxShadow: '0 0 8px #FF1493'
            }}
          />
          <div
            className="absolute bottom-[15%] left-[15%] h-2 w-2 animate-css-particle rounded-full opacity-65 shadow-lg"
            style={{ 
              backgroundColor: '#00CED1',
              animationDelay: '2s',
              boxShadow: '0 0 8px #00CED1'
            }}
          />
          <div
            className="absolute bottom-[20%] right-[20%] h-3 w-3 animate-css-particle rounded-full opacity-70 shadow-lg"
            style={{ 
              backgroundColor: '#FF69B4',
              animationDelay: '0.5s',
              boxShadow: '0 0 10px #FF69B4'
            }}
          />
          <div
            className="absolute left-[50%] top-[-10%] h-2 w-2 animate-css-particle rounded-full opacity-60 shadow-lg"
            style={{ 
              backgroundColor: '#9370DB',
              animationDelay: '1.5s',
              boxShadow: '0 0 8px #9370DB'
            }}
          />
          <div
            className="absolute right-[5%] bottom-[-5%] h-2.5 w-2.5 animate-css-particle rounded-full opacity-65 shadow-lg"
            style={{ 
              backgroundColor: '#FFA500',
              animationDelay: '2.5s',
              boxShadow: '0 0 10px #FFA500'
            }}
          />
        </>
      )}

      {/* Inner light glow */}
      {enableInnerLight && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-2xl"
          style={{ backgroundColor: '#FFD700' }}
        />
      )}
    </div>
  )
}

