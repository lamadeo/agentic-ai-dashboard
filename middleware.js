import { NextResponse } from 'next/server';

/**
 * Authentication middleware
 * Protects all routes except /login and /api/auth/*
 * Checks for auth-session cookie set by login API
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow access to login page and auth API routes
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check for auth session cookie
  const authSession = request.cookies.get('auth-session');

  // If no valid session, redirect to login
  if (!authSession || authSession.value !== 'authenticated') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Valid session - allow access
  return NextResponse.next();
}

/**
 * Configure which routes this middleware runs on
 * Runs on all routes except static files and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
