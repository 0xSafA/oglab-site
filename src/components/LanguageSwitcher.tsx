'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

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
  const pathname = usePathname()
  const router = useRouter()
  const primaryColor = '#536C4A'
  const [isOpen, setIsOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState('en')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Detect current locale from pathname
  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean)
    const detectedLocale = locales.find(l => l.code === parts[0])
    if (detectedLocale) {
      setCurrentLocale(detectedLocale.code)
    }
  }, [pathname])

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

  const changeLocale = (code: string) => {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length && locales.some(l => l.code === parts[0])) {
      parts[0] = code
    } else {
      parts.unshift(code)
    }
    router.push('/' + parts.join('/'))
    router.refresh()
    setIsOpen(false)
    setCurrentLocale(code)
  }

  const current = locales.find(l => l.code === currentLocale) || locales[0]

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
        style={{ 
          backgroundColor: `${primaryColor}10`,
          color: primaryColor,
          '--primary-color': primaryColor
        } as React.CSSProperties & { [key: string]: string }}
      >
        <span className="text-lg">{current.flag}</span>
        <span>{current.label}</span>
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
