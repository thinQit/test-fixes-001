export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/health')) {
    return NextResponse.next();
  }

  if (request.method === 'GET') {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const cookieName = process.env.SESSION_COOKIE_NAME || 'session';
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : request.cookies.get(cookieName)?.value;

  if (!token || !process.env.JWT_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*']
};

export default middleware;
