'use client';

import { useState, useMemo } from 'react';
import {
  Search, Filter, UserPlus, Edit, KeyRound, CheckCircle2,
  XCircle, X, Shield, Phone, Mail, User as UserIcon, Landmark, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { createUser, updateUser, resetUserPassword, toggleUserStatus } from '@/app/actions/superadmin';
import toast from 'react-hot-toast';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  phone: string;
  branch_id: number | null;
  branch_name: string;
}

interface BranchOption {
  id: number;
  branch_name: string;
  branch_code: string;
}

interface UserManagementViewProps {
  initialUsers: UserData[];
  branches: BranchOption[];
}

export default function UserManagementView({ initialUsers, branches }: UserManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserData | null>(null);

  // Form Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State untuk Role saat Create/Edit (untuk conditional Branch)
  const [selectedRole, setSelectedRole] = useState('BRANCH');
  const [editSelectedRole, setEditSelectedRole] = useState('BRANCH');

  // Filtered & Searched Users
  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.branch_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [initialUsers, searchQuery, roleFilter, statusFilter]);

  // Handlers
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await createUser(formData);
    setIsLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || 'User berhasil dibuat!');
      setIsCreateOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await updateUser(formData);
    setIsLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || 'Data user berhasil diperbarui!');
      setEditUser(null);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await resetUserPassword(formData);
    setIsLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || 'Password berhasil direset!');
      setPasswordUser(null);
    }
  };

  const handleToggleStatus = async (user: UserData) => {
    const newStatus = user.status === 'ACTIVE' ? 'NON_ACTIVE' : 'ACTIVE';
    const actionText = newStatus === 'ACTIVE' ? 'mengaktifkan' : 'menonaktifkan';

    if (!confirm(`Apakah Anda yakin ingin ${actionText} akun ${user.name}?`)) {
      return;
    }

    const toastId = toast.loading('Memproses status user...');
    const res = await toggleUserStatus(user.id, newStatus);

    if (res.error) {
      toast.error(res.error, { id: toastId });
    } else {
      toast.success(res.message || `Status user berhasil diubah!`, { id: toastId });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">SUPER ADMIN</span>;
      case 'ADMIN':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">ADMIN IT</span>;
      case 'ENGINEER':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">ENGINEER</span>;
      case 'BRANCH':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">CABANG</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen User</h1>
          <p className="text-sm text-slate-500">Kelola akun seluruh pengguna sistem, perbarui password, dan atur status akun.</p>
        </div>

        <button
          onClick={() => {
            setSelectedRole('BRANCH');
            setIsCreateOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          <UserPlus size={18} />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau cabang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
          />
        </div>

        {/* Filter Role */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Filter size={16} className="text-slate-400 mr-2" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer pr-2"
          >
            <option value="ALL" className="text-slate-900">Semua Role</option>
            <option value="ADMIN" className="text-slate-900">Admin IT</option>
            <option value="BRANCH" className="text-slate-900">Cabang</option>
            <option value="ENGINEER" className="text-slate-900">Engineer</option>
            <option value="SUPER_ADMIN" className="text-slate-900">Super Admin</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer pr-2"
          >
            <option value="ALL" className="text-slate-900">Semua Status</option>
            <option value="ACTIVE" className="text-slate-900">Aktif</option>
            <option value="NON_ACTIVE" className="text-slate-900">Non-Aktif</option>
          </select>
        </div>
      </div>

      {/* USER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-left font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Cabang Bank</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200 text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{user.branch_name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {user.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditSelectedRole(user.role);
                            setEditUser(user);
                          }}
                          title="Edit User"
                          className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>

                        {/* Reset Password Button */}
                        <button
                          onClick={() => setPasswordUser(user)}
                          title="Reset Password"
                          className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <KeyRound size={16} />
                        </button>

                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 'ACTIVE' ? "Non-aktifkan User" : "Aktifkan User"}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'ACTIVE'
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada user yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREATE USER */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={20} className="text-primary" />
                <span>Tambah User Baru</span>
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Warning Email Nyata */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Penting:</strong> Gunakan <strong>email nyata yang aktif</strong>. Sistem mengirimkan notifikasi penugasan dan status tiket otomatis ke alamat email user.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Masukkan nama user..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span>Email *</span>
                  <span className="text-[10px] text-amber-600 font-semibold leading-none font-sans lowercase">*(wajib email nyata/aktif)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="email@banksumut.co.id"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role *</label>
                  <select
                    name="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="BRANCH" className="text-slate-900">Cabang</option>
                    <option value="ADMIN" className="text-slate-900">Admin IT</option>
                    <option value="ENGINEER" className="text-slate-900">Engineer</option>
                    <option value="SUPER_ADMIN" className="text-slate-900">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue="ACTIVE"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="ACTIVE" className="text-slate-900">Aktif</option>
                    <option value="NON_ACTIVE" className="text-slate-900">Non-Aktif</option>
                  </select>
                </div>
              </div>

              {/* Cabang Bank (Hanya ditampilkan jika Role = BRANCH) */}
              {selectedRole === 'BRANCH' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cabang Bank <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="branch_id"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="" className="text-slate-900">-- Pilih Cabang Bank --</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="text-slate-900">
                        [{b.branch_code}] {b.branch_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">No. Telepon / HP</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="0812xxxx"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
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
                  {isLoading ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT USER */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit size={20} className="text-primary" />
                <span>Edit User: {editUser.name}</span>
              </h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="hidden" name="id" value={editUser.id} />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editUser.name}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span>Email *</span>
                  <span className="text-[10px] text-amber-600 font-semibold leading-none font-sans lowercase">*(wajib email nyata/aktif)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editUser.email}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role *</label>
                  <select
                    name="role"
                    defaultValue={editUser.role}
                    onChange={(e) => setEditSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="BRANCH" className="text-slate-900">Cabang</option>
                    <option value="ADMIN" className="text-slate-900">Admin IT</option>
                    <option value="ENGINEER" className="text-slate-900">Engineer</option>
                    <option value="SUPER_ADMIN" className="text-slate-900">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editUser.status}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="ACTIVE" className="text-slate-900">Aktif</option>
                    <option value="NON_ACTIVE" className="text-slate-900">Non-Aktif</option>
                  </select>
                </div>
              </div>

              {/* Cabang Bank (Hanya ditampilkan jika Role = BRANCH) */}
              {editSelectedRole === 'BRANCH' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cabang Bank <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="branch_id"
                    defaultValue={editUser.branch_id || ''}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="" className="text-slate-900">-- Pilih Cabang Bank --</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="text-slate-900">
                        [{b.branch_code}] {b.branch_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">No. Telepon / HP</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={editUser.phone}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-sm"
                >
                  {isLoading ? 'Menyimpan...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESET PASSWORD */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <KeyRound size={20} className="text-amber-600" />
                <span>Reset Password</span>
              </h3>
              <button onClick={() => setPasswordUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Reset password untuk user <strong className="text-slate-800">{passwordUser.name}</strong> ({passwordUser.email}).
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <input type="hidden" name="userId" value={passwordUser.id} />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password Baru *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    required
                    minLength={6}
                    placeholder="Masukkan password baru..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setPasswordUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm"
                >
                  {isLoading ? 'Memproses...' : 'Ubah Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
