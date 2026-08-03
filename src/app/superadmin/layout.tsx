'use client';

import { useState, useEffect } from 'react';
import { Users, Landmark, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutUser, getCurrentUser } from '@/app/actions/auth';
import { Toaster } from 'react-hot-toast';

export default function SuperAdminLayout({
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

            {/* TOPBAR HORISONTAL */}
            <header className="bg-primary text-white sticky top-0 z-40 shadow-md">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">

                    {/* BRANDING LOGO */}
                    <div className="flex items-center gap-6">
                        <Link href="/superadmin/users" className="flex items-center gap-2.5 group">
                            <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
                                <ShieldCheck size={20} className="text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-sm md:text-base tracking-wide block leading-tight">
                                    BANK SUMUT
                                </span>
                                <span className="text-[10px] text-white/70 block uppercase tracking-wider">
                                    Super Admin Portal
                                </span>
                            </div>
                        </Link>

                        {/* DESKTOP NAV LINKS */}
                        <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-white/10 pl-4">
                            <Link
                                href="/superadmin/users"
                                className={`${navLinkClass} ${isActive('/superadmin/users') ? activeLinkClass : inactiveLinkClass}`}
                            >
                                <Users size={16} />
                                <span>Manajemen User</span>
                            </Link>

                            <Link
                                href="/superadmin/branches"
                                className={`${navLinkClass} ${isActive('/superadmin/branches') ? activeLinkClass : inactiveLinkClass}`}
                            >
                                <Landmark size={16} />
                                <span>Manajemen Cabang</span>
                            </Link>
                        </nav>
                    </div>

                    {/* RIGHT ACTIONS (USER & LOGOUT) */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                            <img
                                src="/profile_placeholder.png"
                                alt="User Avatar"
                                className="w-7 h-7 rounded-full object-cover border border-white/20"
                            />
                            <div className="text-left">
                                <p className="text-xs font-semibold leading-tight">{user?.name || "Super Admin"}</p>
                                <p className="text-[10px] text-white/70 font-mono">SUPER ADMIN</p>
                            </div>
                        </div>

                        <form action={logoutUser}>
                            <button
                                type="submit"
                                title="Keluar dari Sistem"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white border border-red-500/30 text-xs font-semibold transition-colors"
                            >
                                <LogOut size={16} />
                                <span>Keluar</span>
                            </button>
                        </form>
                    </div>

                    {/* MOBILE HAMBURGER BUTTON */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* MOBILE MENU DRAWER */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-white/10 bg-primary/95 backdrop-blur-md px-4 py-3 space-y-2">
                        <Link
                            href="/superadmin/users"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`${navLinkClass} w-full justify-start ${isActive('/superadmin/users') ? activeLinkClass : inactiveLinkClass}`}
                        >
                            <Users size={16} />
                            <span>Manajemen User</span>
                        </Link>

                        <Link
                            href="/superadmin/branches"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`${navLinkClass} w-full justify-start ${isActive('/superadmin/branches') ? activeLinkClass : inactiveLinkClass}`}
                        >
                            <Landmark size={16} />
                            <span>Manajemen Cabang</span>
                        </Link>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img
                                    src="/profile_placeholder.png"
                                    alt="User Avatar"
                                    className="w-7 h-7 rounded-full object-cover border border-white/20"
                                />
                                <div>
                                    <p className="text-xs font-semibold">{user?.name || "Super Admin"}</p>
                                    <p className="text-[10px] text-white/70">SUPER ADMIN</p>
                                </div>
                            </div>
                            <form action={logoutUser}>
                                <button
                                    type="submit"
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-200 text-xs font-semibold"
                                >
                                    <LogOut size={14} />
                                    <span>Keluar</span>
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
