import { NextResponse, NextRequest } from 'next/server';
import PocketBase from 'pocketbase';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pb = new PocketBase(process.env.POCKETBASE_URL);
  
  // Get cookies from headers
  const cookieHeader = request.headers.get('cookie') || '';
  const authParam = url.searchParams.get('auth');
  
  // Load auth state from cookie
  pb.authStore.loadFromCookie(cookieHeader);
  
  // Special handling for auth redirects
  if (authParam && pb.authStore.isValid) {
    // Create absolute URL for redirect
    const redirectUrl = new URL(url.pathname, request.url);
    
    // Clone response to avoid modifying the original
    const response = NextResponse.redirect(redirectUrl);
    
    // Ensure cookie is set in the response
    response.headers.append(
      'Set-Cookie',
      pb.authStore.exportToCookie({
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/'
      })
    );
    
    return response;
  }
  
  // Handle protected routes
  const protectedRoutes = ['/account', '/upload', '/dashboard'];
  const isProtected = protectedRoutes.some(path => url.pathname.startsWith(path));
  
  if (isProtected && !pb.authStore.isValid) {
    // Create absolute URL for login redirect
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/account', '/upload', '/dashboard/:path*'],
};