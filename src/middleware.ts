import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('ticketing_session');

  // 1. Definisikan rute mana saja yang butuh proteksi
  const isAdminRoute = path.startsWith('/admin');
  const isBranchRoute = path.startsWith('/branch');
  const isEngineerRoute = path.startsWith('/engineer');
  const isLoginPage = path === '/';

  // Helper untuk mendapatkan rute yang benar berdasarkan role
  const getDashboardPath = (userRole: string) => {
    if (userRole === 'ADMIN') return '/admin/dashboard';
    if (userRole === 'BRANCH') return '/branch/dashboard';
    if (userRole === 'ENGINEER') return '/engineer';
    return '/'; // Fallback
  };

  // 2. Jika BELUM LOGIN dan mencoba akses halaman dalam, tendang ke halaman login (/)
  if (!sessionCookie && (isAdminRoute || isBranchRoute || isEngineerRoute)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. Jika SUDAH LOGIN, kita cek kecocokan role-nya
  if (sessionCookie) {
    try {
      // Ambil data dari cookie JSON
      const sessionData = JSON.parse(sessionCookie.value);
      const role = sessionData.role;

      // Jika user yang sudah login mencoba buka halaman login (/), arahkan langsung ke dashboard-nya
      if (isLoginPage) {
        return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
      }

      // Proteksi Rute Admin
      if (isAdminRoute && role !== 'ADMIN') {
        return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
      }

      // Proteksi Rute Branch
      if (isBranchRoute && role !== 'BRANCH') {
        return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
      }

      // Proteksi Rute Engineer
      if (isEngineerRoute && role !== 'ENGINEER') {
        return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
      }

    } catch (error) {
      // Jika cookie rusak atau dimanipulasi, hapus paksa dan tendang ke halaman login
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('ticketing_session');
      return response;
    }
  }

  // Jika semua pengecekan aman, izinkan user mengakses halamannya
  return NextResponse.next();
}

// Konfigurasi Matcher: Tentukan URL mana saja yang akan diawasi oleh Middleware ini
export const config = {
  matcher: [
    '/', 
    '/admin/:path*', 
    '/branch/:path*', 
    '/engineer/:path*'
  ],
};