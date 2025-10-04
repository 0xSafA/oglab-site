'use client'

import { usePathname } from '@/navigation'
import { useState, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'
import { useRouter as useNextRouter } from 'next/navigation'

const locales = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
]

export default function LanguageSwitcher() {
  const pathname = usePathname() // This gives us pathname WITHOUT locale prefix
  const nextRouter = useNextRouter()
  const locale = useLocale()
  const primaryColor = '#536C4A'
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Use the locale from next-intl
  const currentLocale = locale

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changeLocale = (newLocale: string) => {
    setIsOpen(false)
    setIsChanging(true)
    
    // Build the new URL with locale prefix
    // pathname from usePathname() is already without locale, so we just add new locale
    const newPath = `/${newLocale}${pathname === '/' ? '' : pathname}`
    
    // Use Next.js router to navigate - no refresh needed, Next.js handles it
    nextRouter.push(newPath, { scroll: false })
    
    // Reset loading state after a short delay (optimistic UI)
    setTimeout(() => setIsChanging(false), 300)
  }

  const current = locales.find(l => l.code === currentLocale) || locales[0]

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className="px-4 py-2 rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
        style={{ 
          backgroundColor: `${primaryColor}10`,
          color: primaryColor,
          '--primary-color': primaryColor
        } as React.CSSProperties & { [key: string]: string }}
      >
        <span className="text-lg">{current.flag}</span>
        <span>{current.label}</span>
        {isChanging ? (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="animate-spin"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border-2 border-[#B0BF93]/40 overflow-hidden z-50 animate-fade-in-up"
        >
          {locales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => changeLocale(locale.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-left ${
                currentLocale === locale.code
                  ? 'bg-gradient-to-r from-[#536C4A] to-[#B0BF93] text-white'
                  : 'text-gray-700 hover:bg-[#B0BF93]/10'
              }`}
            >
              <span className="text-xl">{locale.flag}</span>
              <span className="font-semibold text-sm">{locale.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
