'use client';

import { useState } from 'react';
import { Headset, User, Lock, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulasi proses loading
    console.log("Mengarahkan ke Dashboard Cabang...");
    
    // PERUBAHAN DI SINI: Sesuaikan dengan nama folder yang baru
    router.push('/admin/dashboard'); 
  };

  return (
    // Container utama: min-h-screen agar otomatis memenuhi tinggi layar
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      
      {/* Card Login */}
      <div className="bg-white p-10 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full max-w-[440px] border border-gray-100">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          {/* Menggunakan bg-primary dari globals.css */}
          <div className="bg-primary text-white p-3 rounded-xl mb-4">
            <Headset size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Bank Sumut Support</h1>
          <p className="text-sm text-gray-500">Bank Sumut Helpdesk Terminal</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {/* Menggunakan ikon User yang valid */}
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="engineer1"
                required
                // Menggunakan focus:ring-primary
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
              />
            </div>
          </div>

          {/* Password Input */}
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
                placeholder="••••••••"
                required
                // Menggunakan focus:ring-primary
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

          {/* Submit Button */}
          <button
            type="submit"
            // Menggunakan bg-primary dan hover:bg-primary-dark
            className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-md text-sm font-medium transition-colors mt-2"
          >
            Secure Login
            <LogIn size={18} />
          </button>

        </form>

        {/* Footer Section */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield size={14} className="text-gray-400" />
          <span>Authorized Personnel Only</span>
        </div>

      </div>
    </div>
  );
}