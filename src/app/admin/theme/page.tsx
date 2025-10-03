'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ThemeAdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to new settings page after 5 seconds
    const timer = setTimeout(() => {
      router.push('/admin/settings')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-blue-200 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              New Admin Panel Available!
            </h1>
            <p className="text-lg text-gray-600">
              Theme settings have been moved to a new location
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 mb-6 border border-blue-100">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              What changed?
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-1">✓</span>
                <span><strong>Static settings</strong> (colors, animations) → <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">.env.local</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-1">✓</span>
                <span><strong>Dynamic settings</strong> (texts, labels) → <Link href="/admin/settings" className="text-blue-600 hover:underline font-semibold">/admin/settings</Link></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-1">✓</span>
                <span><strong>Performance</strong> → 10x faster page loads!</span>
              </li>
              </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/admin/settings"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl text-center"
            >
              Go to New Settings Panel →
            </Link>
            <Link
              href="/admin"
              className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 text-center"
            >
              ← Back to Admin
            </Link>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Auto-redirecting to new settings in 5 seconds...
          </p>
        </div>

        {/* Documentation Card */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-xl">📚</span>
            Need help?
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            Check out the documentation for detailed setup instructions:
          </p>
          <div className="flex flex-wrap gap-2">
            <code className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">SETUP_GUIDE.md</code>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">PERFORMANCE_IMPROVEMENTS.md</code>
          </div>
        </div>
      </div>
    </div>
  )
}
