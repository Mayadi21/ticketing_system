// src/app/engineer/layout.tsx

'use client';

import { useState, useEffect } from 'react';
import {
    Ticket,
    User,
    LogOut,
    Headset,
    Menu,
    X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { logoutUser, getCurrentUser } from '@/app/actions/auth';

export default function EngineerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; role: string; image?: string | null } | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getCurrentUser();
            if (userData) {
                setUser(userData);
            }
        };
        fetchUser();
    }, []);

    const storageUrl = "/attachments";
    const profileImage = user?.image
        ? (user.image.startsWith('http') || user.image.startsWith('/') ? user.image : `${storageUrl}/${user.image}`)
        : "/profile_placeholder.png";

    const isActive = (path: string) => {
        if (path === '/engineer') {
            return pathname === '/engineer' || pathname === '/engineer/';
        }
        return pathname?.includes(path);
    };

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
                        <Link href="/engineer" className="flex items-center gap-2.5 group">
                            <div className="bg-white/20 p-1.5 rounded-lg text-white shadow-inner group-hover:bg-white/30 transition-colors">
                                <Headset size={18} />
                            </div>
                            <span className="font-bold text-white text-base tracking-tight">Bank Sumut Support</span>
                        </Link>

                        {/* DESKTOP NAV LINKS */}
                        <nav className="hidden md:flex items-center gap-1">
                            <Link
                                href="/engineer"
                                className={`${navLinkClass} ${isActive('/engineer') ? activeLinkClass : inactiveLinkClass}`}
                            >
                                <Ticket size={16} />
                                <span>Tugas Tiket</span>
                            </Link>
                            <Link
                                href="/engineer/profile"
                                className={`${navLinkClass} ${isActive('/engineer/profile') ? activeLinkClass : inactiveLinkClass}`}
                            >
                                <User size={16} />
                                <span>Profil Saya</span>
                            </Link>
                        </nav>

                        {/* USER PROFILE & LOGOUT */}
                        <div className="hidden md:flex items-center gap-3 border-l border-white/15 pl-3">
                            <Link href="/engineer/profile" className="flex items-center gap-2.5 group">
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-white group-hover:text-white/90 leading-tight">
                                        {user ? user.name : 'Loading...'}
                                    </p>
                                    <p className="text-[10px] text-white/70">
                                        {user?.role ? user.role : 'IT Support Team'}
                                    </p>
                                </div>
                                <div className="relative">
                                    <img
                                        src={profileImage}
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
                                href="/engineer"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`${navLinkClass} ${isActive('/engineer') ? activeLinkClass : inactiveLinkClass}`}
                            >
                                <Ticket size={16} />
                                <span>Tugas Tiket</span>
                            </Link>
                            <Link
                                href="/engineer/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`${navLinkClass} ${isActive('/engineer/profile') ? activeLinkClass : inactiveLinkClass}`}
                            >
                                <User size={16} />
                                <span>Profil Saya</span>
                            </Link>
                        </nav>

                        <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <img
                                    src={profileImage}
                                    alt="User Avatar"
                                    className="h-7 w-7 rounded-full border border-white/30 bg-white/10 object-cover"
                                />
                                <div>
                                    <p className="text-xs font-semibold text-white">{user?.name || 'Loading...'}</p>
                                    <p className="text-[10px] text-white/70">{user?.role || 'IT Support Team'}</p>
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