'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Ticket,
  LogOut,
  Headset,
  Menu,
  User,
  Landmark,
  X
} from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutUser, getCurrentUser } from '@/app/actions/auth';
import { Toaster } from 'react-hot-toast';


export default function BranchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sesi State untuk mengontrol Sidebar di tampilan Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  // URL BASE UNTUK SUPABASE STORAGE BUCKET ATTACHMENTS
  const supabaseStorageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments`;

  // Ambil data user langsung dari database saat layout pertama kali dimuat
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    };
    fetchUser();
  }, []);

  // Helper untuk menentukan menu aktif
  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  // Kelas CSS untuk link navigasi di Sidebar (Tema Gelap/Primary)
  const navLinkClass = "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm";
  const inactiveLinkClass = "text-white/80 hover:bg-white/5 hover:text-white font-medium";
  const activeLinkClass = "bg-white/10 text-white font-bold shadow-sm";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative font-sans">

      {/* MOBILE OVERLAY (Latar belakang gelap saat menu terbuka di HP) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-primary text-white flex flex-col transform transition-transform duration-300 ease-in-out shrink-0
                md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
        {/* Logo & Mobile Close Button */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl text-white shadow-inner">
              <Headset size={22} />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Bank Sumut Support</h1>
              <p className="text-[11px] text-white/70">Branch Portal</p>
            </div>
          </div>

          {/* Tombol Tutup Menu (Khusus Mobile) */}
          <button
            className="md:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigasi Menu Utama */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <Link
            href="/branch/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className={`${navLinkClass} ${isActive('/branch/dashboard') ? activeLinkClass : inactiveLinkClass}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Overview</span>
          </Link>
          <Link
            href="/branch/tickets"
            onClick={() => setIsSidebarOpen(false)}
            className={`${navLinkClass} ${isActive('/branch/tickets') ? activeLinkClass : inactiveLinkClass}`}
          >
            <Ticket size={18} />
            <span>My Tickets</span>
          </Link>
          <Link
            href="/branch/profile"
            onClick={() => setIsSidebarOpen(false)}
            className={`${navLinkClass} ${isActive('/branch/profile') ? activeLinkClass : inactiveLinkClass}`}
          >
            <User size={18} />
            <span>My Profile</span>
          </Link>
        </nav>

        {/* Bagian Bawah Sidebar (Tombol Logout) */}
        <div className="p-4 border-t border-white/10">
          <form action={logoutUser}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors font-medium"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
                        <Toaster position="top-center" reverseOrder={false} />


        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-10 shadow-sm">

          {/* Left Side: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3 relative z-10">
            {/* Tombol Hamburger (Hanya muncul di Mobile) */}
            <button
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div>
              <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">Branch / Panel</p>
              <h2 className="font-semibold text-slate-900 text-sm md:text-base">Ticket Management</h2>
            </div>
          </div>

          {/* Right Side: Profil Pegawai & Nama Cabang Dinamis */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">
                {user ? user.name : 'Loading...'}
              </p>
              <p className="text-xs font-medium text-slate-500 flex items-center justify-end gap-1">
                <Landmark size={12} className="text-slate-400" />
                {user?.branch?.branch_name ? user.branch.branch_name : 'Branch Office'}
              </p>
            </div>

            {/* Foto Profil dari Storage Supabase (Fallback ke DiceBear jika null) */}
            <div className="relative">
              <img
                src={
                  user?.image
                    ? `${supabaseStorageUrl}/${user.image}`
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Branch'}`
                }
                alt="User Avatar"
                className="h-8 w-8 md:h-10 md:w-10 rounded-full border border-slate-200 bg-slate-100 object-cover shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
          </div>
        </header>

        {/* MAIN INNER CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0">
          {children}
        </div>
      </main>

    </div>
  );
}