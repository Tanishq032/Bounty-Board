import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if session cookie exists
  const session = request.cookies.get('bounty_board_session');

  // Protect /app routes and /settings
  if (request.nextUrl.pathname.startsWith('/app') || request.nextUrl.pathname.startsWith('/settings')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/settings/:path*'],
};
