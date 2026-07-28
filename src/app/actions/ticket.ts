// src/utils/actions/ticket.ts

"use server";

import { createAdminClient, createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

import { sendTicketAssignmentEmail } from "@/utils/email/ticketAssigned";
import { sendTicketResolvedEmail } from "@/utils/email/ticketResolved";
import { sendNewTicketToAdminEmail } from "@/utils/email/ticketCreatedForAdmin";

export async function getTicketMetadata() {
  const supabase = await createAdminClient();

  const { data: branches } = await supabase
    .from("branch")
    .select("id, branch_name, branch_code")
    .order("branch_name");

  const { data: engineers } = await supabase
    .from("user")
    .select("id, name, role")
    .eq("role", "ENGINEER")
    .order("name");

  return { branches: branches || [], engineers: engineers || [] };
}

export async function submitBranchTicketData(formData: FormData) {
  const supabase = await createAdminClient();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie) {
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };
  }

  const sessionData = JSON.parse(sessionCookie.value);
  const userId = sessionData.id;

  // 1. Ambil Data Form
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const files = formData.getAll("files") as File[];

  // Validasi file (karena di role branch file wajib ada)
  if (files.length === 0 || (files.length === 1 && files[0].size === 0)) {
    return { error: "Minimal harus mengupload 1 file lampiran." };
  }
  if (files.length > 3) {
    return { error: "Maksimal file yang diizinkan hanya 3." };
  }

  try {
    // 2. Dapatkan branch_id milik user yang sedang login
    const { data: userData, error: userFetchError } = await supabase
      .from("user")
      .select("branch_id")
      .eq("id", userId)
      .single();

    if (userFetchError || !userData?.branch_id) {
      return { error: "Gagal mengambil data cabang Anda dari database." };
    }
    const affectedBranchId = userData.branch_id;

    // 3. Dapatkan branch_code untuk penomoran tiket
    const { data: branchData, error: branchError } = await supabase
      .from("branch")
      .select("branch_code, branch_name")
      .eq("id", affectedBranchId)
      .single();

    if (branchError || !branchData?.branch_code) {
      throw new Error("Gagal mengambil kode cabang untuk penomoran tiket.");
    }
    
    const branchCode = branchData.branch_code.trim();
    const branchName = branchData.branch_name; // Kita butuh ini untuk Email
    const currentYearFull = new Date().getFullYear();
    const year2Digit = currentYearFull.toString().slice(-2);

    // 4. Hitung urutan tiket bulan/tahun ini
    const { count, error: countError } = await supabase
      .from("problem")
      .select("*", { count: "exact", head: true })
      .eq("affected_branch_id", affectedBranchId)
      .gte("created_at", `${currentYearFull}-01-01T00:00:00.000Z`)
      .lte("created_at", `${currentYearFull}-12-31T23:59:59.999Z`);

    if (countError) throw countError;

    const nextSequence = (count || 0) + 1;
    const sequenceString = nextSequence.toString().padStart(4, "0");
    const ticketNo = `${branchCode}-${year2Digit}-${sequenceString}`;

    // 5. Insert Data Problem (Status otomatis OPEN, tanpa deadline & assign)
    const { data: problem, error: problemError } = await supabase
      .from("problem")
      .insert({
        ticket_no: ticketNo,
        title: title,
        description: description,
        priority: "MEDIUM",
        status: "OPEN", 
        created_by: userId,
        affected_branch_id: affectedBranchId,
      })
      .select()
      .single();

    if (problemError) throw problemError;

    // 6. Handle Upload Lampiran
    for (const file of files) {
      if (file.size > 0) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${problem.id}_${Date.now()}.${fileExt}`;
        const filePath = `problems/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: attachError } = await supabase
          .from("problem_attachment")
          .insert({
            problem_id: problem.id,
            file_path: filePath,
          });

        if (attachError) throw attachError;
      }
    }

    // Ambil semua data user yang memiliki role ADMIN
    const { data: adminsToNotify, error: fetchAdminError } = await supabase
      .from("user")
      .select("name, email")
      .eq("role", "ADMIN");

    if (!fetchAdminError && adminsToNotify && adminsToNotify.length > 0) {
      // Kirim email ke semua admin secara paralel tanpa memblokir proses
      await Promise.allSettled(
        adminsToNotify.map((admin) =>
          sendNewTicketToAdminEmail(
            admin.email,
            admin.name,
            branchName,
            ticketNo, // Didapat dari logika penomoran tiket sebelumnya
            title,
            description
          )
        )
      );
    }

    return {
      success: true,
      message: "Tiket berhasil dibuat!",
    };
    
  } catch (error: any) {
    console.error("DEBUG ERROR SUBMIT BRANCH TICKET:", error);
    return { error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function submitTicketData(formData: FormData) {
  const supabase = await createAdminClient();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie)
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };

  const sessionData = JSON.parse(sessionCookie.value);
  const userId = sessionData.id;
  const userRole = sessionData.role?.toUpperCase();

  // 1. Ambil Data Dasar dari Form
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const isAdmin = userRole === "ADMIN";

  const engineerIds = formData.getAll("engineer_ids") as string[];
  if (isAdmin && engineerIds.length === 0) {
    return { error: "Admin wajib memilih minimal satu Engineer." };
  }

  // 2. Tentukan affectedBranchId
  let affectedBranchId: number | null = null;
  let deadline: string | null = null;

  if (isAdmin) {
    const rawBranchId = formData.get("affected_branch");
    deadline = formData.get("deadline") as string | null;
    if (!rawBranchId) return { error: "ID Cabang yang dipilih tidak valid." };
    affectedBranchId = parseInt(rawBranchId as string);
  } else {
    const { data: userData, error: userFetchError } = await supabase
      .from("user")
      .select("branch_id")
      .eq("id", userId)
      .single();

    if (userFetchError || !userData?.branch_id) {
      return { error: "Gagal mengambil data cabang user dari database." };
    }
    affectedBranchId = userData.branch_id;
  }

  if (!affectedBranchId)
    return { error: "ID Cabang tidak valid atau tidak ditemukan." };

  try {
    // KITA TAMBAHKAN branch_name DI SELECT AGAR BISA DIPAKAI DI EMAIL
    const { data: branchData, error: branchError } = await supabase
      .from("branch")
      .select("branch_code, branch_name")
      .eq("id", affectedBranchId)
      .single();

    if (branchError || !branchData?.branch_code) {
      throw new Error("Gagal mengambil kode cabang untuk penomoran tiket.");
    }
    const branchCode = branchData.branch_code.trim();
    const branchName = branchData.branch_name; // Simpan nama cabang
    const currentYearFull = new Date().getFullYear();
    const year2Digit = currentYearFull.toString().slice(-2);

    const { count, error: countError } = await supabase
      .from("problem")
      .select("*", { count: "exact", head: true })
      .eq("affected_branch_id", affectedBranchId)
      .gte("created_at", `${currentYearFull}-01-01T00:00:00.000Z`)
      .lte("created_at", `${currentYearFull}-12-31T23:59:59.999Z`);

    if (countError) throw countError;

    const nextSequence = (count || 0) + 1;
    const sequenceString = nextSequence.toString().padStart(4, "0");
    const ticketNo = `${branchCode}-${year2Digit}-${sequenceString}`;

    // 2. Insert Problem
    const { data: problem, error: problemError } = await supabase
      .from("problem")
      .insert({
        ticket_no: ticketNo,
        title: title,
        description: description,
        priority: "MEDIUM",
        status: isAdmin ? "ASSIGNED" : "OPEN",
        created_by: userId,
        affected_branch_id: affectedBranchId,
        approved_by: isAdmin ? userId : null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      })
      .select()
      .single();

    if (problemError) throw problemError;

    // 3A. LOGIKA NOTIFIKASI JIKA ADMIN YANG MEMBUAT (Kirim ke Engineer)
    if (isAdmin && engineerIds.length > 0) {
      const numericEngIds = engineerIds.map((id) => parseInt(id));
      const engInsertData = numericEngIds.map((id) => ({
        problem_id: problem.id,
        engineer_id: id,
        assigned_by: userId,
      }));

      const { error: engError } = await supabase
        .from("problem_eng")
        .insert(engInsertData);
      if (engError) throw engError;

      // Hapus komentar pada blok ini jika ingin email engineer dikirim saat Admin assign
      const { data: engineersToNotify, error: fetchEngError } = await supabase
        .from("user")
        .select("name, email")
        .in("id", numericEngIds);

      if (!fetchEngError && engineersToNotify) {
        await Promise.allSettled(
          engineersToNotify.map((eng) =>
            sendTicketAssignmentEmail(
              eng.email,
              eng.name,
              ticketNo,
              title,
              description,
            ),
          ),
        );
      }
    }

    // 3B. LOGIKA NOTIFIKASI JIKA BRANCH YANG MEMBUAT (Kirim ke Semua Admin)
    if (!isAdmin) {
      // Ambil semua data user yang ber-role ADMIN
      const { data: adminsToNotify, error: fetchAdminError } = await supabase
        .from("user")
        .select("name, email")
        .eq("role", "ADMIN");

      if (!fetchAdminError && adminsToNotify && adminsToNotify.length > 0) {
        // Kirim email ke masing-masing admin secara paralel
        await Promise.allSettled(
          adminsToNotify.map((admin) =>
            sendNewTicketToAdminEmail(
              admin.email,
              admin.name,
              branchName, // Didapat dari query branch di atas
              ticketNo,
              title,
              description,
            ),
          ),
        );
      }
    }

    // 4. Handle Upload Lampiran (Tetap sama seperti kode Anda sebelumnya)
    const files = formData.getAll("files") as File[];
    if (files.length > 3) {
      return { error: "Maksimal file yang diizinkan hanya 3." };
    }

    for (const file of files) {
      if (file.size > 0) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${problem.id}_${Date.now()}.${fileExt}`;
        const filePath = `problems/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: attachError } = await supabase
          .from("problem_attachment")
          .insert({
            problem_id: problem.id,
            file_path: filePath,
          });

        if (attachError) throw attachError;
      }
    }

    return {
      success: true,
      message: "Tiket berhasil dibuat & notifikasi terkirim!",
    };
  } catch (error: any) {
    console.error("DEBUG ERROR:", error);
    return { error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function setAndAssignTicket(
  ticketId: number,
  priority: string,
  deadline: string,
  engineerIds: string[],
) {
  const supabase = await createAdminClient();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie)
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };

  const sessionData = JSON.parse(sessionCookie.value);
  const assignedBy = sessionData.id;

  try {
    // 1. Ambil detail tiket untuk kebutuhan email
    const { data: ticket, error: ticketError } = await supabase
      .from("problem")
      .select("ticket_no, title, description")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) throw new Error("Gagal mengambil data tiket.");

    // 2. Update status, prioritas, dan deadline
    const { error: problemError } = await supabase
      .from("problem")
      .update({
        priority,
        status: "ASSIGNED",
        deadline: new Date(deadline).toISOString(),
        approved_by: assignedBy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (problemError) throw problemError;

    // 3. Reset dan insert engineer ke tabel relasi
    await supabase.from("problem_eng").delete().eq("problem_id", ticketId);

    const numericEngIds = engineerIds.map((id) => parseInt(id));
    const insertRows = numericEngIds.map((engId) => ({
      problem_id: ticketId,
      engineer_id: engId,
      assigned_by: assignedBy,
    }));

    const { error: engError } = await supabase
      .from("problem_eng")
      .insert(insertRows);
    if (engError) throw engError;

    // 4. Ambil data nama & email engineer lalu kirim email
    const { data: engineersToNotify, error: fetchEngError } = await supabase
      .from("user")
      .select("name, email")
      .in("id", numericEngIds);

    if (!fetchEngError && engineersToNotify) {
      await Promise.allSettled(
        engineersToNotify.map((eng) =>
          sendTicketAssignmentEmail(
            eng.email,
            eng.name,
            ticket.ticket_no,
            ticket.title,
            ticket.description,
          ),
        ),
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in setAndAssignTicket:", error);
    return { error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function addMoreEngineersToTicket(
  ticketId: number,
  newEngineerIds: string[],
) {
  const supabase = await createAdminClient();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie)
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };

  const sessionData = JSON.parse(sessionCookie.value);
  const assignedBy = sessionData.id;

  try {
    // 1. Ambil detail tiket untuk email
    const { data: ticket, error: ticketError } = await supabase
      .from("problem")
      .select("ticket_no, title, description")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) throw new Error("Gagal mengambil data tiket.");

    // 2. Insert engineer baru ke tabel relasi
    const numericEngIds = newEngineerIds.map((id) => parseInt(id));
    const insertRows = numericEngIds.map((engId) => ({
      problem_id: ticketId,
      engineer_id: engId,
      assigned_by: assignedBy,
    }));

    const { error } = await supabase.from("problem_eng").insert(insertRows);
    if (error) throw error;

    // 3. Ambil data nama & email engineer baru lalu kirim email
    const { data: engineersToNotify, error: fetchEngError } = await supabase
      .from("user")
      .select("name, email")
      .in("id", numericEngIds);

    if (!fetchEngError && engineersToNotify) {
      await Promise.allSettled(
        engineersToNotify.map((eng) =>
          sendTicketAssignmentEmail(
            eng.email,
            eng.name,
            ticket.ticket_no,
            ticket.title,
            ticket.description,
          ),
        ),
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in addMoreEngineersToTicket:", error);
    return { error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function startSolveTicket(ticketId: string) {
  const supabase = await createAdminClient();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie)
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };

  try {
    const { error } = await supabase
      .from("problem")
      .update({
        status: "IN_PROGRESS",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("DEBUG ERROR START SOLVE:", error);
    return {
      error:
        error.message || "Terjadi kesalahan saat memulai pengerjaan tiket.",
    };
  }
}

export async function submitSolutionData(formData: FormData) {
  const supabase = await createAdminClient();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie)
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };

  const ticketIdStr = formData.get("ticketId") as string;
  const solutionNote = formData.get("solutionNote") as string;

  if (!ticketIdStr || !solutionNote) {
    return { error: "ID Tiket dan Catatan Solusi wajib diisi." };
  }

  const ticketId = parseInt(ticketIdStr);

  try {
    // 1. Ambil data tiket sebelum di-update untuk mendapatkan relasi user
    const { data: problemData, error: problemFetchError } = await supabase
      .from("problem")
      .select("ticket_no, title, created_by, approved_by")
      .eq("id", ticketId)
      .single();

    if (problemFetchError || !problemData) {
      throw new Error("Gagal mengambil data tiket untuk notifikasi.");
    }

    // 2. Update status dan solution_note di tabel problem
    const { error: updateError } = await supabase
      .from("problem")
      .update({
        status: "RESOLVED", // atau 'RESOLVED' sesuai enum Anda
        solution_note: solutionNote,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (updateError) throw updateError;

    // 3. Handle Upload Lampiran Solusi
    const files = formData.getAll("files") as File[];
    for (const file of files) {
      if (file.size > 0) {
        const fileExt = file.name.split(".").pop();
        const fileName = `sol_${ticketId}_${Date.now()}.${fileExt}`;
        const filePath = `solutions/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: attachError } = await supabase
          .from("solution_attachment")
          .insert({
            problem_id: ticketId,
            file_path: filePath,
          });

        if (attachError) throw attachError;
      }
    }

    // 4. Handle Notifikasi Email
    // Kumpulkan ID pengguna (abaikan jika null)
    const userIdsToNotify = [
      problemData.created_by,
      problemData.approved_by,
    ].filter(Boolean);

    // Hapus duplikasi menggunakan Set (jika created_by == approved_by)
    const uniqueUserIds = Array.from(new Set(userIdsToNotify));

    if (uniqueUserIds.length > 0) {
      // Ambil data nama dan email user dari database
      const { data: usersToNotify, error: userError } = await supabase
        .from("user") // Pastikan nama tabel user Anda sesuai (misal 'users' atau 'user')
        .select("name, email")
        .in("id", uniqueUserIds);

      if (!userError && usersToNotify) {
        await Promise.allSettled(
          usersToNotify.map((user) =>
            sendTicketResolvedEmail(
              user.email,
              user.name,
              problemData.ticket_no,
              problemData.title,
              solutionNote,
            ),
          ),
        );
      }
    }

    return {
      success: true,
      message: "Tiket berhasil diselesaikan dan solusi tersimpan!",
    };
  } catch (error: any) {
    console.error("DEBUG ERROR SUBMIT SOLUTION:", error);
    return {
      error: error.message || "Terjadi kesalahan sistem saat menyimpan solusi",
    };
  }
}

// src/app/actions/ticket.ts

export async function closeTicket(problemId: number | string) {
  const supabase = await createClient(); // sesuaikan inisialisasi client Anda

  const { data, error } = await supabase
    .from("problem")
    .update({ status: "CLOSED" })
    .eq("id", problemId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
