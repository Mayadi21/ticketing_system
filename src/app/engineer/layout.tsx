'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth'; // Import fungsi getCurrentUser
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { logoutUser } from '@/app/actions/auth';

export default function EngineerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    // State untuk menyimpan data engineer dari database
    const [user, setUser] = useState<{ name: string; role: string; image?: string | null } | null>(null);

    // Ambil data user saat layout pertama kali dimuat
    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getCurrentUser();
            if (userData) {
                setUser(userData);
            }
        };
        fetchUser();
    }, []);

    // Setup URL untuk gambar profile (menangani path Supabase atau URL eksternal)
    const supabaseStorageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments`;

    const profileImage = user?.image
        ? (user.image.startsWith('http') ? user.image : `${supabaseStorageUrl}/${user.image}`)
        : "https://api.dicebear.com/7.x/avataaars/svg?seed=Engineer"; // Fallback default

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Toaster position="top-center" reverseOrder={false} />
            {/* TOP NAVIGATION BAR */}
            <header className="h-16 md:h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                {/* Left: Titles */}
                <div className="flex items-center">
                    <div className="flex items-center gap-3 pr-4 md:pr-6 border-r border-slate-200">
                        <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-inner">
                            B
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight">Bank Sumut Support</h1>
                        </div>
                    </div>
                    <div className="pl-4 md:pl-6 flex items-center gap-2">
                        <LayoutGrid size={18} className="text-primary hidden md:block" />
                        <h2 className="text-lg md:text-xl font-bold text-slate-700">Engineer Portal</h2>
                    </div>
                </div>

                {/* Right: Profile & Logout */}
                <div className="flex items-center gap-4">
                    {/* Membungkus Nama dan Gambar dengan Link agar bisa diklik */}
                    <Link
                        href="/engineer/profile"
                        className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden sm:block">
                            {/* Menampilkan Nama dan Role dari Database */}
                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {user ? user.name : 'Loading...'}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                                {user?.role ? user.role : 'IT Support Team'}
                            </p>
                        </div>
                        <div className="relative">
                            {/* Menampilkan Gambar dari Database */}
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm bg-slate-100 object-cover"
                            />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                    </Link>

                    <div className="h-6 w-px bg-slate-200 mx-1"></div>
                    <form action={logoutUser}>
                        <button
                            type="submit"
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors p-2"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </form>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col overflow-hidden p-6 md:p-8">
                {children}
            </main>
        </div>
    );
}