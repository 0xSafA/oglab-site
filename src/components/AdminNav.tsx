'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

interface AdminNavProps {
  user: User
}

export default function AdminNav({ user }: AdminNavProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const navItems = [
    { href: '/admin/menu', label: 'Items' },
    { href: '/admin/theme', label: 'Settings' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand logo linking to home */}
          <div className="flex items-center">
            <Link href="/" aria-label="Go to home" className="flex items-center">
              <Image
                src="/assets/images/oglab_logo_round.svg"
                alt="OG Lab Logo"
                width={50}
                height={50}
                className="rounded-full admin-logo"
                priority
              />
            </Link>
          </div>

          {/* Navigation links - visible on mobile, single row, scrollable if overflow */}
          <div className="flex items-center space-x-4 flex-nowrap overflow-x-auto no-scrollbar text-sm sm:text-base">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#536C4A] text-white'
                      : 'text-gray-700 hover:text-[#536C4A] hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* User actions */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-sm text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
        {/* Mobile extra nav removed to avoid duplicates; top bar now scrolls if overflow */}
      </div>
    </nav>
  )
}
