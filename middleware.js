import { NextResponse } from 'next/server';

// Explicitly use Edge Runtime
export const runtime = 'edge';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout'];

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Get the auth cookie
  const authCookie = request.cookies.get('auth-session');
  const isAuthenticated = authCookie?.value === 'authenticated';

  // Allow access to public paths
  if (isPublicPath) {
    // If authenticated and trying to access login, redirect to dashboard
    if (pathname === '/login' && isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protect all other paths - require authentication
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow authenticated users to access protected paths
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /assets/* (public assets directory)
     * - /assets/ (public assets for login page)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets/).*)',
  ],
};
