'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Ticket,
  User,
  LogOut,
  Landmark,
  Menu,
  X
} from "lucide-react";
import { logoutUser } from '@/app/actions/auth'; 


export default function BranchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State untuk mengontrol Sidebar di tampilan Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">

      {/* MOBILE OVERLAY (Latar belakang gelap saat menu terbuka) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-primary text-white flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo & Mobile Close Button */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-xl mr-3">
              <Landmark size={22} />
            </div>
            <div>
              <h1 className="font-bold text-white md:text-lg text-base">Bank Sumut Support</h1>
              <p className="text-[10px] md:text-xs text-white/70">Enterprise Helpdesk</p>
            </div>
          </div>

          {/* Tombol Silang (Tutup Menu) Khusus Mobile */}
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <a href="dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </a>
          <a href="tickets" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/5 hover:text-white transition-colors">
            <Ticket size={18} />
            <span>Ticket Queue</span>
          </a>
          <a href="profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/5 hover:text-white transition-colors">
            <User size={18} />
            <span>Profile</span>
          </a>
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-white/10">
          {/* Membungkus tombol dengan form untuk memanggil Server Action logoutUser */}
          <form action={logoutUser}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">

          <div className="flex items-center gap-3">
            {/* Tombol Hamburger Khusus Mobile */}
            <button
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div>
              <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">Branch / Dashboard</p>
              <h2 className="font-semibold text-slate-900 text-sm md:text-base">Helpdesk Dashboard</h2>
            </div>
          </div>

          {/* Profil Kanan */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">Andi Saputra</p>
              <p className="text-xs text-slate-500">Branch Manager</p>
            </div>
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andi"
              alt="Avatar"
              className="h-8 w-8 md:h-10 md:w-10 rounded-full border border-slate-200"
            />
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}