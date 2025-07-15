import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const rawCookie = req.headers.get('cookie') || '';
  const pb = new PocketBase(process.env.POCKETBASE_URL);

  pb.authStore.loadFromCookie(rawCookie);

  try {
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
    }
  } catch (e) {
    console.error('AUTH REFRESH ERROR:', e);
    pb.authStore.clear();
  }

  const protectedRoutes = ['/account', '/upload', '/dashboard'];
  const isProtected = protectedRoutes.some((path) => url.pathname.startsWith(path));

  if (isProtected && !pb.authStore.isValid) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account', '/upload', '/dashboard/:path*'],
};
