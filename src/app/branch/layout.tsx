// src/app/branch/layout.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Ticket,
  User,
  LogOut,
  Headset,
  Menu,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  const storageUrl = "/attachments";

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
      } else {
        await logoutUser();
      }
    };
    fetchUser();
  }, []);

  const isActive = (path: string) => pathname?.includes(path);

  const navLinkClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs md:text-sm font-medium";
  const inactiveLinkClass = "text-white/80 hover:bg-white/10 hover:text-white";
  const activeLinkClass = "bg-white/20 text-white font-semibold shadow-inner";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Toaster position="top-center" reverseOrder={false} />

      {/* COMPACT TOP HORIZONTAL NAVIGATION BAR */}
      <header className="bg-primary text-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* BRAND LOGO */}
            <Link href="/branch/dashboard" className="flex items-center gap-2.5 group">
              <div className="bg-white/20 p-1.5 rounded-lg text-white shadow-inner group-hover:bg-white/30 transition-colors">
                <Headset size={18} />
              </div>
              <span className="font-bold text-white text-base tracking-tight">Bank Sumut Support</span>
            </Link>

            {/* DESKTOP NAV LINKS */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/branch/dashboard"
                className={`${navLinkClass} ${isActive('/branch/dashboard') ? activeLinkClass : inactiveLinkClass}`}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/branch/tickets"
                className={`${navLinkClass} ${isActive('/branch/tickets') ? activeLinkClass : inactiveLinkClass}`}
              >
                <Ticket size={16} />
                <span>My Tickets</span>
              </Link>
              <Link
                href="/branch/profile"
                className={`${navLinkClass} ${isActive('/branch/profile') ? activeLinkClass : inactiveLinkClass}`}
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>
            </nav>

            {/* USER PROFILE & LOGOUT */}
            <div className="hidden md:flex items-center gap-3 border-l border-white/15 pl-3">
              <Link href="/branch/profile" className="flex items-center gap-2.5 group">
                <div className="text-right">
                  <p className="text-xs font-semibold text-white group-hover:text-white/90 leading-tight">
                    {user ? user.name : 'Loading...'}
                  </p>
                  <p className="text-[10px] text-white/70 flex items-center justify-end gap-1">
                    <Landmark size={10} className="text-white/60" />
                    {user?.branch?.branch_name ? user.branch.branch_name : 'Branch Office'}
                  </p>
                </div>
                <div className="relative">
                  <img
                    src={
                      user?.image
                        ? (user.image.startsWith('http') || user.image.startsWith('/') ? user.image : `${storageUrl}/${user.image}`)
                        : '/profile_placeholder.png'
                    }
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full border border-white/30 bg-white/10 object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-primary rounded-full"></span>
                </div>
              </Link>

              <form action={logoutUser}>
                <button
                  type="submit"
                  className="p-1.5 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </form>
            </div>

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              className="md:hidden text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/15 bg-primary px-4 py-2.5 space-y-2">
            <nav className="flex flex-col space-y-1">
              <Link
                href="/branch/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${navLinkClass} ${isActive('/branch/dashboard') ? activeLinkClass : inactiveLinkClass}`}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/branch/tickets"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${navLinkClass} ${isActive('/branch/tickets') ? activeLinkClass : inactiveLinkClass}`}
              >
                <Ticket size={16} />
                <span>My Tickets</span>
              </Link>
              <Link
                href="/branch/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${navLinkClass} ${isActive('/branch/profile') ? activeLinkClass : inactiveLinkClass}`}
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>
            </nav>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    user?.image
                      ? (user.image.startsWith('http') || user.image.startsWith('/') ? user.image : `${storageUrl}/${user.image}`)
                      : '/profile_placeholder.png'
                  }
                  alt="User Avatar"
                  className="h-7 w-7 rounded-full border border-white/30 bg-white/10 object-cover"
                />
                <div>
                  <p className="text-xs font-semibold text-white">{user?.name || 'Loading...'}</p>
                  <p className="text-[10px] text-white/70">{user?.branch?.branch_name || 'Branch Office'}</p>
                </div>
              </div>
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}