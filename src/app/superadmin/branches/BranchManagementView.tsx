'use client';

import { useState, useMemo } from 'react';
import {
  Search, Plus, Edit, Trash2, Landmark, MapPin, Phone, Building, X, AlertTriangle
} from 'lucide-react';
import { createBranch, updateBranch, deleteBranch } from '@/app/actions/superadmin';
import toast from 'react-hot-toast';

interface BranchData {
  id: number;
  branch_name: string;
  address: string;
  city_prov: string;
  phone: string;
  zip_code: string;
  branch_code: string;
  userCount: number;
  problemCount: number;
}

interface BranchManagementViewProps {
  initialBranches: BranchData[];
}

export default function BranchManagementView({ initialBranches }: BranchManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<BranchData | null>(null);
  const [deleteBranchData, setDeleteBranchData] = useState<BranchData | null>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);

  // Filtered Branches
  const filteredBranches = useMemo(() => {
    return initialBranches.filter((b) => {
      const q = searchQuery.toLowerCase();
      return (
        b.branch_name.toLowerCase().includes(q) ||
        b.branch_code.toLowerCase().includes(q) ||
        b.city_prov.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
      );
    });
  }, [initialBranches, searchQuery]);

  // Handlers
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await createBranch(formData);
    setIsLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || 'Cabang bank berhasil ditambahkan!');
      setIsCreateOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await updateBranch(formData);
    setIsLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || 'Data cabang berhasil diperbarui!');
      setEditBranch(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBranchData) return;

    setIsLoading(true);
    const toastId = toast.loading('Menghapus cabang...');

    const res = await deleteBranch(deleteBranchData.id);
    setIsLoading(false);

    if (res.error) {
      toast.error(res.error, { id: toastId });
    } else {
      toast.success(res.message || 'Cabang berhasil dihapus!', { id: toastId });
      setDeleteBranchData(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Cabang Bank</h1>
          <p className="text-sm text-slate-500">Kelola daftar cabang Bank Sumut, kode cabang, dan informasi lokasi.</p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Tambah Cabang Baru</span>
        </button>
      </div>

      {/* SEARCH PANEL */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama cabang, kode cabang (KPS), atau kota/provinsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* BRANCH TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-left font-semibold">
              <tr>
                <th className="px-6 py-4">Kode</th>
                <th className="px-6 py-4">Nama Cabang</th>
                <th className="px-6 py-4">Kota / Provinsi</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4">Telepon</th>
                <th className="px-6 py-4 text-center">User / Tiket</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBranches.length > 0 ? (
                filteredBranches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">
                      <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-md">
                        {b.branch_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{b.branch_name}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{b.city_prov}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-[250px] truncate" title={b.address}>
                      {b.address}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{b.phone || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-semibold text-slate-500">
                        {b.userCount} User | {b.problemCount} Tiket
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => setEditBranch(b)}
                          title="Edit Cabang"
                          className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteBranchData(b)}
                          title="Hapus Cabang"
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada cabang bank yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREATE BRANCH */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Landmark size={20} className="text-primary" />
                <span>Tambah Cabang Baru</span>
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kode Cabang (3 Karakter Unik) *
                </label>
                <input
                  type="text"
                  name="branch_code"
                  maxLength={3}
                  required
                  placeholder="KPS"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white font-mono font-bold uppercase placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Cabang *</label>
                <input
                  type="text"
                  name="branch_name"
                  required
                  placeholder="KC Medan Utama..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kota / Provinsi *</label>
                <input
                  type="text"
                  name="city_prov"
                  required
                  placeholder="Medan, Sumatera Utara"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Alamat Lengkap *</label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Jl. Imam Bonjol No. 18..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telepon</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="061-4512345"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kode Pos</label>
                  <input
                    type="text"
                    name="zip_code"
                    maxLength={5}
                    placeholder="20112"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-sm"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Cabang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT BRANCH */}
      {editBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit size={20} className="text-primary" />
                <span>Edit Cabang: {editBranch.branch_name}</span>
              </h3>
              <button onClick={() => setEditBranch(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="hidden" name="id" value={editBranch.id} />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kode Cabang (3 Karakter Unik) *
                </label>
                <input
                  type="text"
                  name="branch_code"
                  defaultValue={editBranch.branch_code}
                  maxLength={3}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white font-mono font-bold uppercase placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Cabang *</label>
                <input
                  type="text"
                  name="branch_name"
                  defaultValue={editBranch.branch_name}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kota / Provinsi *</label>
                <input
                  type="text"
                  name="city_prov"
                  defaultValue={editBranch.city_prov}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Alamat Lengkap *</label>
                <textarea
                  name="address"
                  defaultValue={editBranch.address}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telepon</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editBranch.phone}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kode Pos</label>
                  <input
                    type="text"
                    name="zip_code"
                    defaultValue={editBranch.zip_code}
                    maxLength={5}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditBranch(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-sm"
                >
                  {isLoading ? 'Menyimpan...' : 'Update Cabang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE BRANCH CONFIRMATION */}
      {deleteBranchData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Hapus Cabang {deleteBranchData.branch_name}?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus cabang <strong>[{deleteBranchData.branch_code}] {deleteBranchData.branch_name}</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setDeleteBranchData(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                {isLoading ? 'Menghapus...' : 'Ya, Hapus Cabang'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
