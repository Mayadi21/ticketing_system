'use client';

import { 
  Building2, 
  Search, 
  MapPin, 
  Phone 
} from 'lucide-react';

export default function AdminBranchListPage() {
  // Data persis dari gambar referensi yang Anda unggah
  const branches = [
    { 
      no: 1, 
      nama: 'Koordinator Medan', 
      alamat: 'Jl. Imam Bonjol No.18', 
      kota: 'Medan, Sumatera Utara', 
      telp: '061-4515100 / 20212' 
    },
    { 
      no: 2, 
      nama: 'Koordinator Pematang Siantar', 
      alamat: 'Jl. Merdeka No.10', 
      kota: 'Pematang Siantar, Sumatera Utara', 
      telp: '0622-21446 / 21111' 
    },
    { 
      no: 3, 
      nama: 'Koordinator Padang Sidimpuan', 
      alamat: 'Jl. Merdeka/Ex Sudirman No.1-A', 
      kota: 'Padang Sidempuan, Sumatera Utara', 
      telp: '0634-23011 / 22700' 
    },
    { 
      no: 4, 
      nama: 'Rantau Prapat', 
      alamat: 'Jl. Jend.Gatot Subroto No.1-A', 
      kota: 'Labuhan Batu, Sumatera Utara', 
      telp: '0624-21242 / 21411' 
    },
    { 
      no: 5, 
      nama: 'Balige', 
      alamat: 'Jl. Sisingamangaraja No. 42', 
      kota: 'Toba Samosir, Sumatera Utara', 
      telp: '0632-21092 / 22312' 
    },
    { 
      no: 6, 
      nama: 'Kabanjahe', 
      alamat: 'Jl. Kapten Pala Bangun No.3', 
      kota: 'Karo, Sumatera Utara', 
      telp: '0628-20448 / 22111' 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="text-primary" size={28} />
            Daftar Kantor Cabang
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lihat informasi dan kontak seluruh kantor cabang Bank Sumut.
          </p>
        </div>
        
        {/* Search Bar Saja */}
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Cari cabang..."
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4 min-w-[200px]">Alamat</th>
                <th className="px-6 py-4">Kota / Provinsi</th>
                <th className="px-6 py-4">No. Telp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.map((branch) => (
                <tr key={branch.no} className="hover:bg-slate-50 transition-colors">
                  
                  {/* No */}
                  <td className="px-6 py-4 text-center font-medium text-slate-500">
                    {branch.no}
                  </td>
                  
                  {/* Nama */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">
                      {branch.nama}
                    </span>
                  </td>
                  
                  {/* Alamat */}
                  <td className="px-6 py-4 text-slate-600 truncate max-w-[250px]">
                    {branch.alamat}
                  </td>
                  
                  {/* Kota / Provinsi */}
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      {branch.kota}
                    </div>
                  </td>
                  
                  {/* No. Telp */}
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      {branch.telp}
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">
            Menampilkan <span className="text-slate-900 font-bold">1 hingga 6</span> dari <span className="text-slate-900 font-bold">6</span> cabang
          </p>
        </div>

      </div>
    </div>
  );
}