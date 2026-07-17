import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('role')?.value;
  const isAuthenticated = !!role;
  
  const { pathname } = request.nextUrl;
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminPage = pathname.startsWith('/admin');
  const isNutritionistPage = pathname.startsWith('/nutritionist');
  const isClientPage = pathname.startsWith('/klien-dashboard') || 
                       pathname.startsWith('/meal-plan') || 
                       pathname.startsWith('/diary') || 
                       pathname.startsWith('/progress') || 
                       pathname.startsWith('/laporan') || 
                       pathname.startsWith('/konsultasi') ||
                       pathname.startsWith('/checkout') ||
                       pathname.startsWith('/onboarding') ||
                       pathname.startsWith('/profil') ||
                       pathname.startsWith('/notifikasi') ||
                       pathname.startsWith('/review');

  // 1. Not logged in: Redirect to login if trying to access any protected area
  if (!isAuthenticated && (isAdminPage || isNutritionistPage || isClientPage)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Already logged in: Redirect away from auth pages
  if (isAuthenticated && isAuthPage) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'nutritionist') return NextResponse.redirect(new URL('/nutritionist/dashboard', request.url));
    return NextResponse.redirect(new URL('/klien-dashboard', request.url));
  }

  // 3. Role-based Authorization Checks
  if (isAuthenticated && role) {
    if (isAdminPage && role !== 'admin') {
      return NextResponse.redirect(new URL('/klien-dashboard', request.url));
    }
    if (isNutritionistPage && role !== 'nutritionist') {
      return NextResponse.redirect(new URL('/klien-dashboard', request.url));
    }
    if (isClientPage && role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (isClientPage && role === 'nutritionist') {
      return NextResponse.redirect(new URL('/nutritionist/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/klien-dashboard/:path*',
    '/nutritionist/:path*',
    '/admin/:path*',
    '/meal-plan/:path*',
    '/diary/:path*',
    '/progress/:path*',
    '/laporan/:path*',
    '/konsultasi/:path*',
    '/checkout/:path*',
    '/onboarding/:path*',
    '/profil/:path*',
    '/notifikasi/:path*',
    '/review/:path*',
    '/login',
    '/register'
  ],
};

