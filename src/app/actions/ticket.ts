'use server';

import { createAdminClient, createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';


export async function getTicketMetadata() {
  const supabase = await createAdminClient(); // atau createClient() sesuai konfigurasi Anda

  // Ambil daftar seluruh cabang untuk dropdown Admin
  const { data: branches } = await supabase
    .from('branch')
    .select('id, branch_name, branch_code')
    .order('branch_name');

  // Ambil daftar engineer (User dengan role 'ENGINEER')
  const { data: engineers } = await supabase
    .from('user')
    .select('id, name, role') // sesuaikan field jika ada (misal: posisi/jabatan IT)
    .eq('role', 'ENGINEER')
    .order('name');

  return { branches: branches || [], engineers: engineers || [] };
}


export async function submitTicketData(formData: FormData) {
  const supabase = await createAdminClient();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('ticketing_session');

  if (!sessionCookie) return { error: 'Sesi tidak ditemukan. Silakan login ulang.' };

  const sessionData = JSON.parse(sessionCookie.value);
  const userId = sessionData.id;
  const userRole = sessionData.role?.toUpperCase();

  // 1. Ambil Data Dasar dari Form
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const isAdmin = userRole === 'ADMIN';

  const engineerIds = formData.getAll('engineer_ids') as string[];
  if (isAdmin && engineerIds.length === 0) {
    return { error: 'Admin wajib memilih minimal satu Engineer.' };
  }

  // 2. Tentukan affectedBranchId secara akurat
  let affectedBranchId: number | null = null;

  if (isAdmin) {
    const rawBranchId = formData.get('affected_branch');
    if (!rawBranchId) return { error: 'ID Cabang yang dipilih tidak valid.' };
    affectedBranchId = parseInt(rawBranchId as string);
  } else {
    // Ambil branch_id terupdate langsung dari DB user (Akan menghasilkan id: 3 untuk user id: 2)
    const { data: userData, error: userFetchError } = await supabase
      .from('user')
      .select('branch_id')
      .eq('id', userId)
      .single();

    if (userFetchError || !userData?.branch_id) {
      return { error: 'Gagal mengambil data cabang user dari database.' };
    }
    affectedBranchId = userData.branch_id; 
  }

  if (!affectedBranchId) return { error: 'ID Cabang tidak valid atau tidak ditemukan.' };

  try {
    // =========================================================================
    // BARU: GENERATE NOMOR TIKET SESUAI FORMAT (CONTOH: KPD-26-0001)
    // =========================================================================
    
    // a. Ambil branch_code berdasarkan affectedBranchId (Contoh: id 3 -> KPD)
    const { data: branchData, error: branchError } = await supabase
      .from('branch')
      .select('branch_code')
      .eq('id', affectedBranchId)
      .single();

    if (branchError || !branchData?.branch_code) {
      throw new Error('Gagal mengambil kode cabang untuk penomoran tiket.');
    }
    const branchCode = branchData.branch_code.trim(); // Bersihkan whitespace jika tipe data bpchar

    // b. Dapatkan 2 digit tahun saat ini (Contoh: 2026 -> 26)
    const currentYearFull = new Date().getFullYear();
    const year2Digit = currentYearFull.toString().slice(-2);

    // c. Hitung total tiket yang sudah dibuat dari cabang tersebut di tahun berjalan untuk autoincrement nomor urut
    const { count, error: countError } = await supabase
      .from('problem')
      .select('*', { count: 'exact', head: true })
      .eq('affected_branch_id', affectedBranchId)
      .gte('created_at', `${currentYearFull}-01-01T00:00:00.000Z`)
      .lte('created_at', `${currentYearFull}-12-31T23:59:59.999Z`);

    if (countError) throw countError;

    // d. Susun nomor urut baru (padEnd/padStart 4 digit)
    const nextSequence = (count || 0) + 1;
    const sequenceString = nextSequence.toString().padStart(4, '0');

    // e. Hasil akhir format nomor tiket
    const ticketNo = `${branchCode}-${year2Digit}-${sequenceString}`;
    // =========================================================================

    // 4. Masukkan Data ke tabel `problem`
    const { data: problem, error: problemError } = await supabase
      .from('problem')
      .insert({
        ticket_no: ticketNo, // Sekarang bernilai format baru (misal: KPD-26-0001)
        title: title,
        description: description,
        priority: 'MEDIUM',
        status: isAdmin ? 'ASSIGNED' : 'OPEN', 
        created_by: userId,
        affected_branch_id: affectedBranchId, // Nilai 3 aman tersimpan
        approved_by: isAdmin ? userId : null, 
      })
      .select()
      .single();

    if (problemError) throw problemError;

    // 5. Masukkan data ke `problem_eng` jika Admin
    if (isAdmin && engineerIds.length > 0) {
      const engInsertData = engineerIds.map((id) => ({
        problem_id: problem.id,
        engineer_id: parseInt(id),
        assigned_by: userId,
      }));

      const { error: engError } = await supabase
        .from('problem_eng')
        .insert(engInsertData);

      if (engError) throw engError;
    }

    // 6. Handle Upload Lampiran (Maksimal 3 file)
    const files = formData.getAll('files') as File[];
    if (files.length > 3) {
      return { error: 'Maksimal file yang diizinkan hanya 3.' };
    }
    
    for (const file of files) {
      if (file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${problem.id}_${Date.now()}.${fileExt}`;
        const filePath = `problems/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: attachError } = await supabase
          .from('problem_attachment')
          .insert({
            problem_id: problem.id,
            file_path: filePath,
          });

        if (attachError) throw attachError;
      }
    }

    return { success: true, message: 'Tiket berhasil dibuat!' };

  } catch (error: any) {
    console.error("DEBUG ERROR:", error);
    return { error: error.message || 'Terjadi kesalahan sistem' };
  }
}