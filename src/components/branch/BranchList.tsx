'use client';

import { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Hash,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// 1. Definisikan tipe data sesuai dengan skema tabel 'branch' di database
export interface Branch {
  id: number;
  branch_name: string;
  address: string;
  city_prov: string;
  phone: string | null;
  zip_code: string | null;
  branch_code: string;
}

// 2. Tentukan props untuk komponen ini
interface BranchListProps {
  initialBranches: Branch[];
}

export default function BranchList({ initialBranches = [] }: BranchListProps) {
  // State untuk pencarian dan pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // Jumlah data per halaman

  // 1. Logika Pencarian (Search)
  const filteredBranches = useMemo(() => {
    if (!searchQuery) return initialBranches;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return initialBranches.filter((branch) => {
      const matchName = branch.branch_name.toLowerCase().includes(lowerCaseQuery);
      const matchCode = branch.branch_code.toLowerCase().includes(lowerCaseQuery);
      return matchName || matchCode;
    });
  }, [initialBranches, searchQuery]);

  // 2. Logika Paginasi (Pagination)
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage);

  // Handler saat mengetik di kolom pencarian
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Kembalikan ke halaman 1 tiap kali pencarian berubah
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="text-primary" size={28} />
            Daftar Cabang Bank Sumut
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Database Cabang Bank Sumut. Total: <span className="font-bold text-slate-900">{initialBranches.length}</span> bank cabang.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari cabang bank..."
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
                <th className="px-6 py-4 w-24 text-center">Kode</th>
                <th className="px-6 py-4">Bank Cabang</th>
                <th className="px-6 py-4 min-w-[200px]">Alamat</th>
                <th className="px-6 py-4">Kota, Provinsi</th>
                <th className="px-6 py-4">Kode Pos</th>
                <th className="px-6 py-4">Telp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBranches.length > 0 ? (
                paginatedBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50 transition-colors">

                    {/* Kode Bank */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                        {branch.branch_code}
                      </span>
                    </td>

                    {/* Nama Cabang */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">
                        {branch.branch_name}
                      </span>
                    </td>

                    {/* Alamat */}
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                      {branch.address}
                    </td>

                    {/* Kota / Provinsi */}
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        {branch.city_prov}
                      </div>
                    </td>

                    {/* Kode Pos */}
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Hash size={14} className="text-slate-400 shrink-0" />
                        {branch.zip_code || '-'}
                      </div>
                    </td>

                    {/* No. Telp */}
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        {branch.phone || '-'}
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                /* Empty State jika pencarian tidak ditemukan */
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada cabang yang sesuai dengan &quot;{searchQuery}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">
            Menampilkan <span className="text-slate-900 font-bold">
              {filteredBranches.length === 0 ? 0 : startIndex + 1}
            </span> hingga <span className="text-slate-900 font-bold">
              {Math.min(startIndex + itemsPerPage, filteredBranches.length)}
            </span> dari <span className="text-slate-900 font-bold">{filteredBranches.length}</span> cabang
          </p>

          {/* Tombol Navigasi Pagination */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm font-medium text-slate-600 px-2">
              Page {currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}