'use client';

import { useState } from 'react';
import { Headset, User, Lock, Eye, EyeOff, LogIn, Shield, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loginUser } from './actions/auth'; // Import Server Action

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMessage('');
    
    // Panggil fungsi backend
    const result = await loginUser(formData);

    if (result.error) {
      // Jika gagal, tampilkan pesan error
      setErrorMessage(result.error);
      setIsLoading(false);
    } else if (result.success) {
      // Jika sukses, arahkan berdasarkan Role sesuai struktur folder Anda
      console.log("Login sukses! Mengarahkan role:", result.role);
      
      if (result.role === 'SUPER_ADMIN') {
        router.push('/superadmin/users');
      } else if (result.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (result.role === 'BRANCH') {
        router.push('/branch/dashboard');
      } else if (result.role === 'ENGINEER') {
        // Engineer langsung ke /engineer sesuai dengan struktur folder Anda
        router.push('/engineer'); 
      } else {
        // Fallback keamanan jika role tidak dikenali
        router.push('/'); 
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="bg-white p-10 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full max-w-[440px] border border-gray-100">
        
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-primary text-white p-3 rounded-xl mb-4">
            <Headset size={32} strokeWidth={1.5} />
          </div>
<h1 className="text-2xl font-bold text-gray-900 mb-1">
  Masuk ke <span className="text-[var(--color-accent)]">SIAP IT</span>
</h1>          <p className="text-sm text-gray-500">Sistem Infrastruktur & Aduan Perangkat IT Bank Sumut</p>
        </div>

        {/* Notifikasi Error */}
        {errorMessage && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Gunakan 'action' bawaan React 19/Next 14 untuk Server Actions */}
        <form action={handleLogin} className="space-y-5">
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="email"
                name="email" // Attribute name wajib ada untuk FormData
                placeholder="email@banksumut.co.id"
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password" // Attribute name wajib ada untuk FormData
                placeholder="••••••••"
                required
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center gap-2 text-white py-2.5 rounded-md text-sm font-medium transition-colors mt-2 ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {isLoading ? 'Memverifikasi...' : 'Login'}
            {!isLoading && <LogIn size={18} />}
          </button>

        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield size={14} className="text-gray-400" />
          <span>Authorized Personnel Only</span>
        </div>

      </div>
    </div>
  );
}