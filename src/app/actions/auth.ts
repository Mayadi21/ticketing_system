'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan password harus diisi!' };
  }

  // 1. Cari user berdasarkan email
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: 'Email tidak terdaftar atau salah.' };
  }

  // 2. Verifikasi Password
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return { error: 'Password yang Anda masukkan salah.' };
  }

  // 3. Set Sesi menggunakan Cookie (agar user tetap login)
  const cookieStore = await cookies();

  // Simpan data penting (tanpa password) ke cookie, convert BigInt ke Number
  const sessionData = {
    id: Number(user.id),
    role: user.role,
    name: user.name,
    branch_id: user.branch_id ? Number(user.branch_id) : null,
    image: user.image,
  };

  cookieStore.set('ticketing_session', JSON.stringify(sessionData), {
    httpOnly: true, // Aman dari serangan XSS
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // Sesi berlaku 8 jam
    path: '/',
  });

  // 4. Kembalikan status sukses dan role untuk keperluan redirect
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

  try {
    const session = JSON.parse(sessionCookie.value);

    // Query ke tabel 'user' berdasarkan ID yang ada di session
    const user = await db.user.findUnique({
      where: { id: BigInt(session.id) },
      select: {
        name: true,
        role: true,
        image: true,
        branch: {
          select: {
            branch_name: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      name: user.name,
      role: user.role,
      image: user.image,
      branch: user.branch ? { branch_name: user.branch.branch_name } : null,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}