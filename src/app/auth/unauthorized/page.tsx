import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#536C4A] to-[#B0BF93] flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-[#B0BF93]/30 p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don&apos;t have permission to access the admin panel. Please contact an administrator if you believe this is an error.
          </p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/auth/login"
            className="block w-full bg-[#536C4A] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#536C4A]/90 transition-colors"
          >
            Try Different Account
          </Link>
          <Link 
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back to Site
          </Link>
        </div>
      </div>
    </div>
  )
}
