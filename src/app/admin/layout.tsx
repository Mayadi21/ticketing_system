// src/app/layout.tsx

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
import { logoutUser, getCurrentUser } from '@/app/actions/auth'; // Import fungsi getCurrentUser
import { Toaster } from 'react-hot-toast';


export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // State untuk menyimpan data user dari database (termasuk properti image)
    const [user, setUser] = useState<{ name: string; role: string; image?: string | null } | null>(null);
    const pathname = usePathname();

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

    const isActive = (path: string) => pathname?.includes(path);

    const navLinkClass = "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm";
    const inactiveLinkClass = "text-white/80 hover:bg-white/5 hover:text-white";
    const activeLinkClass = "bg-white/10 text-white font-semibold shadow-sm";

    // Buat URL base untuk public storage bucket 'attachments'
const supabaseStorageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments`;
    return (
        
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">

            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}


            {/* SIDEBAR */}
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
                            <h1 className="font-bold text-white text-lg">Ticketing System</h1>
                            <p className="text-[11px] text-white/70">Bank Sumut</p>
                        </div>
                    </div>

                    <button
                        className="md:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    <Link href="/admin/dashboard" className={`${navLinkClass} ${isActive('/dashboard') ? activeLinkClass : inactiveLinkClass}`}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/tickets" className={`${navLinkClass} ${isActive('/tickets') ? activeLinkClass : inactiveLinkClass}`}>
                        <Ticket size={18} />
                        <span>Tiket</span>
                    </Link>
                    <Link href="/admin/branches" className={`${navLinkClass} ${isActive('/branches') ? activeLinkClass : inactiveLinkClass}`}>
                        <Landmark size={18} />
                        <span>Cabang Bank</span>
                    </Link>
                    <Link href="/admin/profile" className={`${navLinkClass} ${isActive('/profile') ? activeLinkClass : inactiveLinkClass}`}>
                        <User size={18} />
                        <span>Profil Saya</span>
                    </Link>
                </nav>

                {/* Bottom Navigation */}
                <div className="p-4 border-t border-white/10">
                    <form action={logoutUser}>
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
                <Toaster position="top-center" reverseOrder={false} />
                {/* HEADER */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-10 shadow-sm">

                    <div className="flex items-center gap-3 relative z-10">
                        <button
                            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>

                        <div>
                            <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">Admin / Dashboard</p>
                            <h2 className="font-semibold text-slate-900 text-sm md:text-base">Helpdesk Dashboard</h2>
                        </div>
                    </div>

                    {/* TAMPILAN PROFIL DINAMIS DARI DATABASE */}
                    <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900">
                        {user ? user.name : 'Loading...'}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                        {user ? user.role.toLowerCase() : 'Administrator'}
                    </p>
                </div>
                
                {/* FOTO PROFIL DARI BUCKET SUPABASE */}
                <img
                    src={
                        user?.image 
                            ? `${supabaseStorageUrl}/${user.image}` 
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Admin'}`
                    }
                    alt="User Avatar"
                    className="h-8 w-8 md:h-10 md:w-10 rounded-full border border-slate-200 bg-slate-100 object-cover"
                />
            </div>
                </header>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0">
                    {children}
                </div>
            </main>

        </div>
    );
}