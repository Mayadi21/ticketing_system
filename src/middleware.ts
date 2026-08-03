import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('ticketing_session');

  // 1. Definisikan rute mana saja yang butuh proteksi
  const isSuperAdminRoute = path.startsWith('/superadmin');
  const isAdminRoute = path.startsWith('/admin');
  const isBranchRoute = path.startsWith('/branch');
  const isEngineerRoute = path.startsWith('/engineer');
  const isLoginPage = path === '/';

  // Helper untuk mendapatkan rute yang benar berdasarkan role
  const getDashboardPath = (userRole: string) => {
    if (userRole === 'SUPER_ADMIN') return '/superadmin/users';
    if (userRole === 'ADMIN') return '/admin/dashboard';
    if (userRole === 'BRANCH') return '/branch/dashboard';
    if (userRole === 'ENGINEER') return '/engineer';
    return '/'; // Fallback
  };

  // 2. Jika BELUM LOGIN dan mencoba akses halaman dalam, tendang ke halaman login (/)
  if (!sessionCookie && (isSuperAdminRoute || isAdminRoute || isBranchRoute || isEngineerRoute)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. Jika SUDAH LOGIN, kita cek kecocokan role-nya
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie.value);
      const role = sessionData.role;
      const status = sessionData.status;

      // Cek jika status user di cookie bernilai NON_ACTIVE / tidak ACTIVE, tendang keluar & hapus cookie
      if (status && status !== 'ACTIVE' && String(status).toUpperCase() !== 'ACTIVE') {
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('ticketing_session');
        return response;
      }

      // Jika user yang sudah login mencoba buka halaman login (/), arahkan langsung ke dashboard-nya
      if (isLoginPage) {
        return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
      }

      // Proteksi Rute Super Admin
      if (isSuperAdminRoute && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
      }

      // Super Admin tidak berurusan dengan rute tiket (Admin, Branch, Engineer)
      if ((isAdminRoute || isBranchRoute || isEngineerRoute) && role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/superadmin/users', request.url));
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
    '/superadmin/:path*',
    '/admin/:path*',
    '/branch/:path*',
    '/engineer/:path*'
  ],
};