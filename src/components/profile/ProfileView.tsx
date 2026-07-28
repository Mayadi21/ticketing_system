'use client';

import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Info
} from 'lucide-react';

// 1. Perbarui Interface: Tambahkan 'null' pada tipe datanya
export interface UserProfileData {
  id: string;
  email: string;
  employee_id: string;
  full_name: string;
  phone: string;
  role: string;
  image: string | null;
  branch_name: string | null;
  location: string | null;
}

interface ProfileViewProps {
  userData: UserProfileData | null;
}

export default function ProfileView({ userData }: ProfileViewProps) {
  if (!userData) return <div className="p-8 text-center">Memuat data profil...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* HEADER PAGE */}
      <div>
        <h1 className="text-[28px] font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Lihat informasi profil Anda, termasuk detail akun dan informasi kontak.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* KOLOM KIRI: SUMMARY CARD */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="h-24 bg-primary"></div>

            <div className="px-6 pb-6 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-white p-1 -mt-10 mb-3 shadow-sm border border-slate-100">
                <img
                  src={
                    userData.image ??
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                      userData.full_name
                    )}`
                  }
                  alt={userData.full_name}
                  className="h-full w-full rounded-full object-cover border border-slate-200 bg-slate-50"
                />
              </div>

              <h2 className="text-xl font-bold text-slate-900">{userData.full_name}</h2>
              <p className="text-sm font-medium text-primary mt-1">{userData.role}</p>

              <span className="mt-3 px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Account Active
              </span>
            </div>

            {/* 2. CONDITIONAL RENDERING: Hanya tampilkan kotak info bawah jika salah satu data ada */}
            {(userData.branch_name || userData.location) && (
              <div className="border-t border-slate-100 px-6 py-4 space-y-3 bg-slate-50/50 flex-1">

                {/* Tampilkan cabang hanya jika ada namanya */}
                {userData.branch_name && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Building size={16} className="text-slate-400 shrink-0" />
                    <span>{userData.branch_name}</span>
                  </div>
                )}

                {/* Tampilkan lokasi hanya jika ada lokasinya */}
                {userData.location && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin size={16} className="text-slate-400 shrink-0" />
                    <span>{userData.location}</span>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: GENERAL INFORMATION (Sama seperti sebelumnya) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Informasi Umum
              </h2>
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 text-blue-800">
                <Info size={20} className="shrink-0 mt-0.5 text-blue-600" />
                <p className="text-sm leading-relaxed">
                  Sebagai <strong>{userData.role}</strong>, informasi profil Anda dikunci dan disinkronkan. Silakan hubungi tim programmer atau Keamanan Perusahaan untuk pembaruan data inti apa pun.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    ID Pegawai
                  </label>
                  <input
                    type="text"
                    value={userData.employee_id || '-'}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={userData.full_name || ''}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={userData.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      value={userData.phone || '-'}
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