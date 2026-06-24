'use client';

import { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  FileText, // <-- Ikon baru untuk Title
  Search, 
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminTicketDetail() {
  const router = useRouter();
  
  // State untuk elemen interaktif Admin Actions
  const [priority, setPriority] = useState('High');
  const [isApproved, setIsApproved] = useState(true);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-[28px] font-bold text-slate-900">
              Ticket TKT-8942
            </h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
{/* LEFT COLUMN: TICKET DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Info Meta Data Card (Sekarang menjadi 3 kolom karena Title dipindahkan) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reported By</p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <User size={18} className="text-slate-400" />
                  Andi
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Branch Location</p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <MapPin size={18} className="text-slate-400" />
                  KC Kampung Lalang
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date Submitted</p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <Calendar size={18} className="text-slate-400" />
                  Oct 24, 2026 - 09:14 AM
                </div>
              </div>

            </div>
          </div>

          {/* Issue Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Issue Details</h3>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              
              {/* BAGIAN TITLE (Dipindahkan ke sini) */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title</p>
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                  <FileText size={20} className="text-primary" />
                  Tidak bisa membuat Mobile Banking
                </div>
              </div>

              {/* BAGIAN DESCRIPTION */}
              <div className="space-y-1.5 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Description</p>
                <p className="text-slate-700 leading-relaxed text-sm md:text-base bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-100">
                  The primary ATM terminal (Unit A) in the lobby has been rejecting all deposit envelopes since opening this morning. The screen displays Error Code 492-B when a customer attempts to insert an envelope. I have tried rebooting the machine twice, but the error persists upon startup. The card reader and cash dispensing functions seem to be working normally, but we are having to redirect all deposit customers to the teller line, which is causing significant delays.
                </p>
              </div>

            </div>
          </div>

          {/* Attachments Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Attachments</h3>
            </div>
            <div className="p-6 md:p-8 flex flex-wrap gap-4">
              {/* Dummy Image 1 */}
              <div className="w-full sm:w-64 aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden relative group border border-slate-200 cursor-pointer">
                {/* Simulasi gambar error ATM */}
                <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-green-500/20 m-4 rounded-lg bg-black">
                  <span className="text-red-500 font-mono text-sm mb-1">ero:ed</span>
                  <span className="text-green-500 font-mono text-sm">Error Code 492-B</span>
                </div>
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <ImageIcon className="text-white" size={32} />
                </div>
              </div>

              {/* Dummy Image 2 */}
              <div className="w-full sm:w-64 aspect-[4/3] bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl overflow-hidden relative group border border-slate-200 cursor-pointer">
                {/* Simulasi slot ATM */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-4 bg-black border-y-2 border-slate-600 rounded-sm shadow-inner shadow-black"></div>
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <ImageIcon className="text-white" size={32} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ADMIN ACTIONS */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-6 flex flex-col">
            
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Admin Actions</h3>
            </div>
            
            <div className="p-6 space-y-8 flex-1">
              
              {/* Priority Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Ticket Priority
                </label>
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
                  {['Low', 'Medium', 'High'].map((level) => (
                    <button 
                      key={level}
                      onClick={() => setPriority(level)}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                        priority === level && level === 'High'
                          ? 'bg-primary text-white shadow-md'
                          : priority === level
                          ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Approve Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Approve to be managed</p>
                  <p className="text-xs text-slate-500 mt-0.5">Approve and assign engineer</p>
                </div>
                {/* CSS Custom Toggle Switch */}
                <button 
                  onClick={() => setIsApproved(!isApproved)}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary/20 ${isApproved ? 'bg-primary' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${isApproved ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Assign Field Engineer */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Assign Field Engineer(s)
                </label>
                
                <div className="space-y-3">
                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search engineers by name or specialty..."
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                  </div>

                  {/* Selected Engineers ListBox */}
                  <div className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto">
                    {/* Simulasi opsi yang dipilih */}
                    <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium shadow-sm mb-1 cursor-pointer">
                      Engineer 1
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border border-slate-400 flex items-center justify-center text-[8px]">i</span>
                    Hold Ctrl/Cmd to select multiple
                  </p>
                </div>
              </div>

            </div>

            {/* Sticky Bottom Action Button */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl mt-auto">
              <button className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:-translate-y-0.5">
                <CheckCircle2 size={18} />
                Confirm Assignment
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}