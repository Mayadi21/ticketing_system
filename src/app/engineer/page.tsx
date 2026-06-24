'use client';

import { 
  MapPin, 
  AlertCircle, 
  Minus, 
  AlertTriangle, 
  CheckCheck,
  LogOut,
  List,
  LayoutGrid
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EngineerDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. TOP NAVIGATION BAR */}
      <header className="h-16 md:h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        
        {/* Left: Titles */}
        <div className="flex items-center">
          <div className="flex items-center gap-3 pr-4 md:pr-6 border-r border-slate-200">
            <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-inner">
              B
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight">Helpdesk Terminal</h1>
            </div>
          </div>
          <div className="pl-4 md:pl-6 flex items-center gap-2">
            <LayoutGrid size={18} className="text-primary hidden md:block" />
            <h2 className="text-lg md:text-xl font-bold text-slate-700">Engineer Portal</h2>
          </div>
        </div>

        {/* Right: Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">Engineer One</p>
            <p className="text-xs font-medium text-slate-500">IT Support Team</p>
          </div>
          <div className="relative">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Engineer" 
              alt="Profile" 
              className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm bg-slate-100 cursor-pointer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <button 
            onClick={() => router.push('/login')} 
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors p-2"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* MAIN KANBAN BOARD */}
      <main className="flex-1 flex flex-col overflow-hidden p-6 md:p-8">
        
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
          
          {/* COLUMN 1: PENDING */}
          <div className="w-80 md:w-96 bg-slate-100/50 border border-slate-200/70 rounded-2xl flex flex-col h-full shadow-sm">
            <div className="p-4 md:p-5 border-b border-slate-200/60 flex items-center justify-between shrink-0 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm"></span>
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-600">Pending</h3>
              </div>
              <span className="bg-slate-200 text-slate-700 text-xs font-extrabold px-2.5 py-1 rounded-lg">2</span>
            </div>
            
            <div className="p-4 md:p-5 flex-1 overflow-y-auto space-y-4">
              
              {/* Task Card 1 (Error/High Priority) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-red-500 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-grab group">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold tracking-wide">TK-8492</span>
                  <AlertCircle size={16} className="text-red-500" />
                </div>
                <h4 className="font-bold text-slate-900 mb-4 leading-relaxed group-hover:text-primary transition-colors">Tidak bisa membuat Mobile Banking</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">KC Kampung Lalang</span>
                </div>
              </div>

              {/* Task Card 2 (Normal) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-slate-400 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-grab group">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold tracking-wide">TK-8501</span>
                  <Minus size={16} className="text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-900 mb-4 leading-relaxed group-hover:text-primary transition-colors">Update API documentation for v2 endpoints</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">KC USU</span>
                </div>
              </div>

            </div>
          </div>

          {/* COLUMN 2: IN PROGRESS */}
          <div className="w-80 md:w-96 bg-blue-50/30 border border-blue-100/70 rounded-2xl flex flex-col h-full shadow-sm">
            <div className="p-4 md:p-5 border-b border-blue-100/60 flex items-center justify-between shrink-0 bg-blue-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm animate-pulse"></span>
                <h3 className="font-bold text-xs uppercase tracking-widest text-blue-800">In Progress</h3>
              </div>
              <span className="bg-blue-200 text-blue-800 text-xs font-extrabold px-2.5 py-1 rounded-lg">1</span>
            </div>
            
            <div className="p-4 md:p-5 flex-1 overflow-y-auto space-y-4">
              
              {/* Task Card 1 (In Progress) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-amber-400 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-grab group ring-1 ring-blue-50">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs font-bold tracking-wide">TK-8477</span>
                  <AlertTriangle size={16} className="text-amber-500" />
                </div>
                <h4 className="font-bold text-slate-900 mb-4 leading-relaxed group-hover:text-blue-600 transition-colors">Investigate memory leak in authentication service</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 mb-4">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">KC Gatot Subroto</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-blue-500 rounded-full"></div>
                </div>
              </div>

            </div>
          </div>

          {/* COLUMN 3: DONE */}
          <div className="w-80 md:w-96 bg-emerald-50/30 border border-emerald-100/70 rounded-2xl flex flex-col h-full shadow-sm">
            <div className="p-4 md:p-5 border-b border-emerald-100/60 flex items-center justify-between shrink-0 bg-emerald-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <CheckCheck size={16} className="text-emerald-500" />
                <h3 className="font-bold text-xs uppercase tracking-widest text-emerald-800">Done</h3>
              </div>
              <span className="bg-emerald-200 text-emerald-800 text-xs font-extrabold px-2.5 py-1 rounded-lg">1</span>
            </div>
            
            <div className="p-4 md:p-5 flex-1 overflow-y-auto space-y-4">
              
              {/* Task Card 1 (Done) */}
              <div className="bg-white/80 p-5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-400 shadow-sm cursor-default opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold tracking-wide line-through">TK-8450</span>
                  <CheckCheck size={16} className="text-emerald-500" />
                </div>
                <h4 className="font-medium text-slate-600 mb-2 leading-relaxed">Implement rate limiting on public API</h4>
                <p className="text-[11px] font-bold text-emerald-600 mt-3 flex items-center gap-1.5">
                  <CheckCheck size={14} /> Completed
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}