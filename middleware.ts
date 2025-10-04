import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware';
import {routing} from './src/navigation';

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Skip i18n for admin, auth, api, and static files
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    /\.[^/]+$/.test(pathname) // has file extension
  ) {
    // For admin/auth routes, handle Supabase auth only
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

    // Debug logging
    process.stderr.write(`🔐 Middleware - Path: ${request.nextUrl.pathname}\n`)
    process.stderr.write(`🔐 Middleware - User: ${user?.email || 'None'}\n`)

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        console.log('🔐 Middleware - No user, redirecting to login')
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/auth/login'
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/auth/unauthorized'
        return NextResponse.redirect(redirectUrl)
      }
    }

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

  // For all other routes, handle i18n routing
  return intlMiddleware(request)
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
