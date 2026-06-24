'use client';

import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  ShieldCheck,
  Info
} from 'lucide-react';

export default function AdminProfilePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* HEADER PAGE */}
      <div>
        <h1 className="text-[28px] font-bold text-slate-900">Admin Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          View your administrative information and account security status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: SUMMARY CARD */}
        <div className="md:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Cover Background */}
            <div className="h-24 bg-primary"></div>
            
            <div className="px-6 pb-6 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="h-20 w-20 rounded-full bg-white p-1 -mt-10 mb-3 shadow-sm border border-slate-100">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoeAdmin" 
                  alt="Admin Avatar" 
                  className="h-full w-full rounded-full border border-slate-200 bg-slate-50"
                />
              </div>
              
              <h2 className="text-xl font-bold text-slate-900">John Doe</h2>
              <p className="text-sm font-medium text-primary mt-1">System Administrator</p>
              
              <span className="mt-3 px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Active System Account
              </span>
            </div>

            <div className="border-t border-slate-100 px-6 py-4 space-y-3 bg-slate-50/50 flex-1">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Building size={16} className="text-slate-400 shrink-0" />
                <span>Bank Sumut Pusat (HO Helpdesk)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <span>Pematangsiantar, Sumatera Utara</span>
              </div>
            </div>
          </div>

          {/* Security Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              Security Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Last Login</p>
                <p className="text-sm font-medium text-slate-800">Today, 07:15 AM WIB</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Account Access Level</p>
                <p className="text-sm font-bold text-primary">Master / HO Level</p>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: GENERAL INFORMATION (READ-ONLY) */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User size={20} className="text-primary" />
                General Information
              </h2>
            </div>
            
            <div className="p-6 md:p-8">
              
              {/* Info Banner */}
              <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 text-blue-800">
                <Info size={20} className="shrink-0 mt-0.5 text-blue-600" />
                <p className="text-sm leading-relaxed">
                  As a System Administrator, your profile information is securely locked and synchronized with the Master Active Directory. Please contact the HR or Enterprise Security team for any core data updates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Employee ID */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Admin ID
                  </label>
                  <input 
                    type="text" 
                    defaultValue="ADM-001294" 
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed text-sm"
                  />
                </div>

                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    defaultValue="John Doe" 
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed text-sm"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input 
                      type="email" 
                      defaultValue="john.doe@banksumut.co.id" 
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input 
                      type="tel" 
                      defaultValue="+62 811-2233-4455" 
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}