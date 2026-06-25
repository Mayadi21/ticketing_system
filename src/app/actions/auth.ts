'use server';

import { createClient } from '@/utils/supabase/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan password harus diisi!' };
  }

  // 1. Inisialisasi Supabase
  const supabase = await createClient();

  // 2. Cari user berdasarkan email
  const { data: user, error } = await supabase
    .from('user')
    .select('*')
    .eq('email', email)
    .single();
  
  console.log("================================");
console.log("Email Input:", email);
console.log("User Found:", user);
console.log("Supabase Error:", error);
console.log("Stored Password:", user?.password);
console.log("================================");

  if (error || !user) {
    return { error: 'Email tidak terdaftar atau salah.' };
  }

  // 3. Verifikasi Password (cocokkan input dengan hash pgcrypto di DB)
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return { error: 'Password yang Anda masukkan salah.' };
  }

  // 4. Set Sesi menggunakan Cookie (agar user tetap login)
  const cookieStore = await cookies();
  
  // Simpan data penting (tanpa password) ke cookie
  const sessionData = {
    id: user.id,
    role: user.role,
    name: user.name,
    branch_id: user.branch_id
  };

  cookieStore.set('ticketing_session', JSON.stringify(sessionData), {
    httpOnly: true, // Aman dari serangan XSS (JavaScript browser tidak bisa baca)
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // Sesi berlaku 8 jam
    path: '/',
  });

  // 5. Kembalikan status sukses dan role untuk keperluan redirect
  return { success: true, role: user.role };
}

// Fungsi Logout Reusable
export async function logoutUser() {
  const cookieStore = await cookies();
  
  // Hapus cookie sesi
  cookieStore.delete('ticketing_session');
  
  // Arahkan kembali ke halaman login (root)
  redirect('/');
}