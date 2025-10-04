import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware';
import {routing} from './src/navigation';

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First, handle i18n routing
  const intlResponse = intlMiddleware(request);
  
  // If i18n redirects, return that response
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { user }, error } = await supabase.auth.getUser()

  // Debug logging - force to stderr so it shows in terminal
  process.stderr.write(`🔐 Middleware - Path: ${request.nextUrl.pathname}\n`)
  process.stderr.write(`🔐 Middleware - User: ${user?.email || 'None'}\n`)
  process.stderr.write(`🔐 Middleware - Error: ${error?.message || 'None'}\n`)

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      console.log('🔐 Middleware - No user, redirecting to login')
      // Redirect to login page
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      // Redirect to unauthorized page
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/unauthorized'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated admin away from login page directly to admin
  if (request.nextUrl.pathname === '/auth/login' && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin/menu'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Match all paths except API routes, static files, and Next.js internals
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Always run for admin and auth paths
    '/admin/:path*',
    '/auth/login'
  ],
}
