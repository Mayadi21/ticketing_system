'use client';

import { 
    MapPin, 
    AlertCircle, 
    Minus, 
    AlertTriangle, 
    CheckCheck,
    List
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EngineerDashboard() {
    const router = useRouter();

    return (
        <>
            {/* SECTION UTAMA: Header Konten & Tombol Pindah View */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 shrink-0">
                <div>
                    <h2 className="text-2xl md:text-[28px] font-extrabold text-slate-900 tracking-tight">My Assigned Tasks</h2>
                    <p className="text-sm text-slate-500 mt-1.5 font-medium">Manage, track, and update your tickets progress seamlessly.</p>
                </div>
                
                <button 
                    onClick={() => router.push('/engineer/tickets')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all shadow-sm self-start sm:self-auto group"
                >
                    <List size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                    <span>View All Tasks</span>
                </button>
            </div>

            {/* Board Container */}
            <div className="flex gap-6 min-w-max flex-1 overflow-x-auto overflow-y-hidden pb-6 custom-scrollbar">
                
                {/* KOLOM PENDING */}
                <div className="w-80 md:w-96 bg-slate-100/50 border border-slate-200/70 rounded-2xl flex flex-col h-full shadow-sm">
                    {/* ... (Isi kolom Pending Anda) ... */}
                </div>

                {/* KOLOM IN PROGRESS */}
                <div className="w-80 md:w-96 bg-blue-50/30 border border-blue-100/70 rounded-2xl flex flex-col h-full shadow-sm">
                    {/* ... (Isi kolom In Progress Anda) ... */}
                </div>

                {/* KOLOM DONE */}
                <div className="w-80 md:w-96 bg-emerald-50/30 border border-emerald-100/70 rounded-2xl flex flex-col h-full shadow-sm">
                    {/* ... (Isi kolom Done Anda) ... */}
                </div>

            </div>
        </>
    );
}