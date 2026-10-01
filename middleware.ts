import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionHash, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isValid = token ? await verifySessionHash(token) : false;

    // If accessing the login page
    if (pathname === '/admin/login') {
      if (isValid) {
        // Already authenticated, redirect to /admin
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // If not authenticated, redirect to /admin/login
    if (!isValid) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
