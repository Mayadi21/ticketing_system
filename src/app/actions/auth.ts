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
    .select('id, name, password, role, branch_id, image')
    .eq('email', email)
    .single();
  
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
    branch_id: user.branch_id,
    image: user.image
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

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('ticketing_session');
    
    if (!sessionCookie) return null;
    
    const session = JSON.parse(sessionCookie.value);
    const supabase = await createClient();

    // Query ke tabel 'user' berdasarkan ID yang ada di session
    const { data: user, error } = await supabase
        .from('user')
        .select('name, role, image, branch:branch_id ( branch_name )')
        .eq('id', session.id)
        .single();

    if (error || !user) {
        console.error('Error fetching current user:', error);
        return null;
    }

    return user;
}