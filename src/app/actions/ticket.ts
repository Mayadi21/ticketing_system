// src/app/actions/ticket.ts

"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const Priority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

const Status = {
  OPEN: "OPEN",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

import { sendTicketAssignmentEmail } from "@/utils/email/ticketAssigned";
import { sendTicketResolvedEmail } from "@/utils/email/ticketResolved";
import { sendNewTicketToAdminEmail } from "@/utils/email/ticketCreatedForAdmin";

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'];

function isValidAttachment(file: File): boolean {
  if (!file || !file.name) return false;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return !!ext && ALLOWED_EXTENSIONS.includes(ext);
}

function validateDeadlineDateServer(deadlineStr: string | null): string | null {
  if (!deadlineStr) return "Deadline penanganan wajib diisi.";
  const selected = new Date(deadlineStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const startOfSelectedDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 0, 0, 0);

  if (startOfSelectedDay < startOfToday) {
    return "Deadline penanganan tidak boleh pada tanggal yang telah lalu.";
  }

  if (startOfSelectedDay.getTime() === startOfToday.getTime()) {
    const today17 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0);
    if (now > today17) {
      if (selected < now) {
        return "Deadline penanganan untuk hari ini tidak boleh kurang dari waktu saat ini.";
      }
    } else {
      if (selected < today17) {
        return "Khusus untuk hari ini, deadline penanganan minimal jam 17:00.";
      }
    }
  }

  return null;
}

// Helper: deteksi apakah STORAGE_PATH adalah URL (Supabase) atau path lokal
function isSupabaseStorageUrl(storagePath: string): boolean {
  return storagePath.startsWith("http://") || storagePath.startsWith("https://");
}

// Helper function untuk menyimpan file lampiran.
// - Jika STORAGE_PATH = URL Supabase → upload via Supabase Storage REST API
// - Jika STORAGE_PATH = path lokal  → simpan ke disk
async function saveAttachmentLocally(file: File, relativeFilePath: string) {
  const storageDir = process.env.STORAGE_PATH || "public/attachments";

  if (isSupabaseStorageUrl(storageDir)) {
    // === Mode Supabase Storage ===
    // storageDir contoh: https://xxx.supabase.co/storage/v1/object/public/attachments
    // Kita perlu upload via REST API: /storage/v1/object/<bucket>/<path>
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Gunakan service_role key (JWT) untuk upload — BUKAN anon key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env");
    }

    // Ekstrak nama bucket dari STORAGE_PATH
    // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>
    const bucketMatch = storageDir.match(/\/storage\/v1\/object\/public\/([^/]+)/);
    if (!bucketMatch) {
      throw new Error(`Format STORAGE_PATH tidak valid: ${storageDir}. Harusnya berupa URL Supabase Storage public.`);
    }
    const bucket = bucketMatch[1];

    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${relativeFilePath}`;
    const bytes = await file.arrayBuffer();

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: bytes,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gagal upload ke Supabase Storage: ${res.status} ${errText}`);
    }

    // Return URL publik Supabase
    return `${storageDir}/${relativeFilePath}`;
  } else {
    // === Mode Lokal (Produksi / server fisik) ===
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fullPath = path.isAbsolute(storageDir)
      ? path.join(storageDir, relativeFilePath)
      : path.join(process.cwd(), storageDir, relativeFilePath);

    const dir = path.dirname(fullPath);
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, buffer);
    return `/attachments/${relativeFilePath}`;
  }
}

export async function getTicketMetadata() {
  const branches = await db.branch.findMany({
    select: {
      id: true,
      branch_name: true,
      branch_code: true,
    },
    orderBy: {
      branch_name: "asc",
    },
  });

  const engineers = await db.user.findMany({
    where: {
      role: "ENGINEER",
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return {
    branches: branches.map((b) => ({ ...b, id: Number(b.id) })),
    engineers: engineers.map((e) => ({ ...e, id: Number(e.id) })),
  };
}

export async function submitBranchTicketData(formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie) {
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };
  }

  const sessionData = JSON.parse(sessionCookie.value);
  const userId = BigInt(sessionData.id);

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
  for (const file of files) {
    if (file.size > 0 && !isValidAttachment(file)) {
      return { error: `File '${file.name}' tidak diizinkan. Hanya file PDF, Docs (.doc/.docx/.txt), dan Gambar yang diperbolehkan.` };
    }
  }

  try {
    // 2. Dapatkan branch_id & status milik user yang sedang login
    const userData = await db.user.findUnique({
      where: { id: userId },
      select: { branch_id: true, status: true },
    });

    if (!userData || (userData.status !== 'ACTIVE' && String(userData.status).toUpperCase() !== 'ACTIVE')) {
      return { error: "Akun Anda telah dinonaktifkan. Silakan hubungi administrator." };
    }

    if (!userData.branch_id) {
      return { error: "Gagal mengambil data cabang Anda dari database." };
    }
    const affectedBranchId = userData.branch_id;

    // 3. Dapatkan branch_code untuk penomoran tiket
    const branchData = await db.branch.findUnique({
      where: { id: affectedBranchId },
      select: { branch_code: true, branch_name: true },
    });

    if (!branchData?.branch_code) {
      throw new Error("Gagal mengambil kode cabang untuk penomoran tiket.");
    }

    const branchCode = branchData.branch_code.trim();
    const branchName = branchData.branch_name;
    const currentYearFull = new Date().getFullYear();
    const year2Digit = currentYearFull.toString().slice(-2);

    // 4. Hitung urutan tiket bulan/tahun ini
    const count = await db.problem.count({
      where: {
        affected_branch_id: affectedBranchId,
        created_at: {
          gte: new Date(`${currentYearFull}-01-01T00:00:00.000Z`),
          lte: new Date(`${currentYearFull}-12-31T23:59:59.999Z`),
        },
      },
    });

    const nextSequence = count + 1;
    const sequenceString = nextSequence.toString().padStart(4, "0");
    const ticketNo = `${branchCode}-${year2Digit}-${sequenceString}`;

    // 5. Insert Data Problem (Status otomatis OPEN, tanpa deadline & assign)
    const problem = await db.problem.create({
      data: {
        ticket_no: ticketNo,
        title: title,
        description: description,
        priority: Priority.MEDIUM,
        status: Status.OPEN,
        created_by: userId,
        affected_branch_id: affectedBranchId,
        updated_at: new Date(),
      },
    });

    // 6. Handle Upload Lampiran
    for (const file of files) {
      if (file.size > 0) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${problem.id}_${Date.now()}.${fileExt}`;
        const filePath = `problems/${fileName}`;

        await saveAttachmentLocally(file, filePath);

        await db.problem_attachment.create({
          data: {
            problem_id: problem.id,
            file_path: filePath,
          },
        });
      }
    }

    // Ambil user pertama yang memiliki role ADMIN dan status ACTIVE
    const adminToNotify = await db.user.findFirst({
      where: { role: "ADMIN", status: "ACTIVE" },
      select: { name: true, email: true },
    });

    if (adminToNotify) {
      await sendNewTicketToAdminEmail(
        adminToNotify.email,
        adminToNotify.name,
        branchName,
        ticketNo,
        title,
        description
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
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie)
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };

  const sessionData = JSON.parse(sessionCookie.value);
  const userId = BigInt(sessionData.id);
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
  let affectedBranchId: bigint | null = null;
  let deadline: string | null = null;

  if (isAdmin) {
    const rawBranchId = formData.get("affected_branch");
    deadline = formData.get("deadline") as string | null;
    if (!rawBranchId) return { error: "ID Cabang yang dipilih tidak valid." };
    affectedBranchId = BigInt(rawBranchId as string);

    const deadlineError = validateDeadlineDateServer(deadline);
    if (deadlineError) return { error: deadlineError };
  } else {
    const userData = await db.user.findUnique({
      where: { id: userId },
      select: { branch_id: true },
    });

    if (!userData?.branch_id) {
      return { error: "Gagal mengambil data cabang user dari database." };
    }
    affectedBranchId = userData.branch_id;
  }

  if (!affectedBranchId)
    return { error: "ID Cabang tidak valid atau tidak ditemukan." };

  try {
    const branchData = await db.branch.findUnique({
      where: { id: affectedBranchId },
      select: { branch_code: true, branch_name: true },
    });

    if (!branchData?.branch_code) {
      throw new Error("Gagal mengambil kode cabang untuk penomoran tiket.");
    }
    const branchCode = branchData.branch_code.trim();
    const branchName = branchData.branch_name;
    const currentYearFull = new Date().getFullYear();
    const year2Digit = currentYearFull.toString().slice(-2);

    const count = await db.problem.count({
      where: {
        affected_branch_id: affectedBranchId,
        created_at: {
          gte: new Date(`${currentYearFull}-01-01T00:00:00.000Z`),
          lte: new Date(`${currentYearFull}-12-31T23:59:59.999Z`),
        },
      },
    });

    const nextSequence = count + 1;
    const sequenceString = nextSequence.toString().padStart(4, "0");
    const ticketNo = `${branchCode}-${year2Digit}-${sequenceString}`;

    // 2. Insert Problem
    const problem = await db.problem.create({
      data: {
        ticket_no: ticketNo,
        title: title,
        description: description,
        priority: Priority.MEDIUM,
        status: isAdmin ? Status.ASSIGNED : Status.OPEN,
        created_by: userId,
        affected_branch_id: affectedBranchId,
        approved_by: isAdmin ? userId : null,
        deadline: deadline ? new Date(deadline) : null,
        updated_at: new Date(),
      },
    });

    // 3A. LOGIKA NOTIFIKASI JIKA ADMIN YANG MEMBUAT (Kirim ke Engineer)
    if (isAdmin && engineerIds.length > 0) {
      const numericEngIds = engineerIds.map((id) => BigInt(id));
      const engInsertData = numericEngIds.map((engId) => ({
        problem_id: problem.id,
        engineer_id: engId,
        assigned_by: userId,
      }));

      await db.problem_eng.createMany({
        data: engInsertData,
      });

      const engineersToNotify = await db.user.findMany({
        where: { id: { in: numericEngIds } },
        select: { name: true, email: true },
      });

      if (engineersToNotify.length > 0) {
        await Promise.allSettled(
          engineersToNotify.map((eng) =>
            sendTicketAssignmentEmail(
              eng.email,
              eng.name,
              ticketNo,
              title,
              description
            )
          )
        );
      }
    }

    // 3B. LOGIKA NOTIFIKASI JIKA BRANCH YANG MEMBUAT (Kirim ke Semua Admin)
    if (!isAdmin) {
      const adminsToNotify = await db.user.findMany({
        where: { role: "ADMIN" },
        select: { name: true, email: true },
      });

      if (adminsToNotify.length > 0) {
        await Promise.allSettled(
          adminsToNotify.map((admin) =>
            sendNewTicketToAdminEmail(
              admin.email,
              admin.name,
              branchName,
              ticketNo,
              title,
              description
            )
          )
        );
      }
    }

    // 4. Handle Upload Lampiran
    const files = formData.getAll("files") as File[];
    if (files.length > 3) {
      return { error: "Maksimal file yang diizinkan hanya 3." };
    }
    for (const file of files) {
      if (file.size > 0 && !isValidAttachment(file)) {
        return { error: `File '${file.name}' tidak diizinkan. Hanya file PDF, Docs (.doc/.docx/.txt), dan Gambar yang diperbolehkan.` };
      }
    }

    for (const file of files) {
      if (file.size > 0) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${problem.id}_${Date.now()}.${fileExt}`;
        const filePath = `problems/${fileName}`;

        await saveAttachmentLocally(file, filePath);

        await db.problem_attachment.create({
          data: {
            problem_id: problem.id,
            file_path: filePath,
          },
        });
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
  ticketId: number | string,
  priority: string,
  deadline: string,
  engineerIds: string[]
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie)
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };

  const sessionData = JSON.parse(sessionCookie.value);
  const assignedBy = BigInt(sessionData.id);
  const bigTicketId = BigInt(ticketId);

  const deadlineError = validateDeadlineDateServer(deadline);
  if (deadlineError) return { error: deadlineError };

  try {
    const ticket = await db.problem.findUnique({
      where: { id: bigTicketId },
      select: { ticket_no: true, title: true, description: true },
    });

    if (!ticket) throw new Error("Gagal mengambil data tiket.");

    await db.problem.update({
      where: { id: bigTicketId },
      data: {
        priority: priority as any,
        status: Status.ASSIGNED,
        deadline: new Date(deadline),
        approved_by: assignedBy,
        updated_at: new Date(),
      },
    });

    await db.problem_eng.deleteMany({
      where: { problem_id: bigTicketId },
    });

    const uniqueEngIds = Array.from(new Set(engineerIds));
    const numericEngIds = uniqueEngIds.map((id) => BigInt(id));
    const insertRows = numericEngIds.map((engId) => ({
      problem_id: bigTicketId,
      engineer_id: engId,
      assigned_by: assignedBy,
    }));

    await db.problem_eng.createMany({
      data: insertRows,
    });

    const engineersToNotify = await db.user.findMany({
      where: { id: { in: numericEngIds } },
      select: { name: true, email: true },
    });

    if (engineersToNotify.length > 0) {
      await Promise.allSettled(
        engineersToNotify.map((eng) =>
          sendTicketAssignmentEmail(
            eng.email,
            eng.name,
            ticket.ticket_no,
            ticket.title,
            ticket.description
          )
        )
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in setAndAssignTicket:", error);
    return { error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function addMoreEngineersToTicket(
  ticketId: number | string,
  newEngineerIds: string[]
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie)
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };

  const sessionData = JSON.parse(sessionCookie.value);
  const assignedBy = BigInt(sessionData.id);
  const bigTicketId = BigInt(ticketId);

  try {
    const ticket = await db.problem.findUnique({
      where: { id: bigTicketId },
      select: { ticket_no: true, title: true, description: true },
    });

    if (!ticket) throw new Error("Gagal mengambil data tiket.");

    const uniqueEngIds = Array.from(new Set(newEngineerIds));
    const numericEngIds = uniqueEngIds.map((id) => BigInt(id));
    const insertRows = numericEngIds.map((engId) => ({
      problem_id: bigTicketId,
      engineer_id: engId,
      assigned_by: assignedBy,
    }));

    await db.problem_eng.createMany({
      data: insertRows,
    });

    const engineersToNotify = await db.user.findMany({
      where: { id: { in: numericEngIds } },
      select: { name: true, email: true },
    });

    if (engineersToNotify.length > 0) {
      await Promise.allSettled(
        engineersToNotify.map((eng) =>
          sendTicketAssignmentEmail(
            eng.email,
            eng.name,
            ticket.ticket_no,
            ticket.title,
            ticket.description
          )
        )
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in addMoreEngineersToTicket:", error);
    return { error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function startSolveTicket(ticketId: string | number) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie)
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };

  try {
    const isNumeric = /^\d+$/.test(String(ticketId));
    const problem = await db.problem.findFirst({
      where: isNumeric
        ? { OR: [{ id: BigInt(ticketId) }, { ticket_no: String(ticketId) }] }
        : { ticket_no: String(ticketId) },
      select: { id: true },
    });

    if (!problem) return { error: "Tiket tidak ditemukan." };

    await db.problem.update({
      where: { id: problem.id },
      data: {
        status: Status.IN_PROGRESS,
        updated_at: new Date(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("DEBUG ERROR START SOLVE:", error);
    return {
      error: error.message || "Terjadi kesalahan saat memulai pengerjaan tiket.",
    };
  }
}

export async function submitSolutionData(formData: FormData) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie)
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };

  const ticketIdStr = formData.get("ticketId") as string;
  const solutionNote = formData.get("solutionNote") as string;

  if (!ticketIdStr || !solutionNote) {
    return { error: "ID Tiket dan Catatan Solusi wajib diisi." };
  }

  try {
    const isNumeric = /^\d+$/.test(ticketIdStr);
    const problemData = await db.problem.findFirst({
      where: isNumeric
        ? { OR: [{ id: BigInt(ticketIdStr) }, { ticket_no: ticketIdStr }] }
        : { ticket_no: ticketIdStr },
      select: { id: true, ticket_no: true, title: true, created_by: true, approved_by: true },
    });

    if (!problemData) {
      throw new Error("Gagal mengambil data tiket untuk notifikasi.");
    }

    const bigTicketId = problemData.id;

    await db.problem.update({
      where: { id: bigTicketId },
      data: {
        status: Status.RESOLVED,
        solution_note: solutionNote,
        updated_at: new Date(),
      },
    });

    // 3. Handle Upload Lampiran Solusi
    const files = formData.getAll("files") as File[];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    if (files.length > 3) {
      return { error: "Maksimal file solusi yang diizinkan hanya 3 file." };
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return { error: `File '${file.name}' melebihi batas ukuran maksimal 5 MB.` };
      }
      if (file.size > 0 && !isValidAttachment(file)) {
        return { error: `File '${file.name}' tidak diizinkan. Hanya file PDF, Docs (.doc/.docx/.txt), dan Gambar yang diperbolehkan.` };
      }
    }
    for (const file of files) {
      if (file.size > 0) {
        const fileExt = file.name.split(".").pop();
        const fileName = `sol_${bigTicketId}_${Date.now()}.${fileExt}`;
        const filePath = `solutions/${fileName}`;

        await saveAttachmentLocally(file, filePath);

        await db.solution_attachment.create({
          data: {
            problem_id: bigTicketId,
            file_path: filePath,
          },
        });
      }
    }

    // 4. Handle Notifikasi Email
    const userIdsToNotify = [
      problemData.created_by,
      problemData.approved_by,
    ].filter(Boolean) as bigint[];

    const uniqueUserIds = Array.from(new Set(userIdsToNotify.map((id) => id.toString()))).map((idStr) => BigInt(idStr));

    if (uniqueUserIds.length > 0) {
      const usersToNotify = await db.user.findMany({
        where: { id: { in: uniqueUserIds } },
        select: { name: true, email: true, role: true },
      });

      if (usersToNotify.length > 0) {
        await Promise.allSettled(
          usersToNotify.map((user) =>
            sendTicketResolvedEmail(
              user.email,
              user.name,
              problemData.ticket_no,
              problemData.title,
              solutionNote,
              user.role
            )
          )
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

export async function closeTicket(problemId: number | string) {
  try {
    const isNumeric = /^\d+$/.test(String(problemId));
    const problem = await db.problem.findFirst({
      where: isNumeric
        ? { OR: [{ id: BigInt(problemId) }, { ticket_no: String(problemId) }] }
        : { ticket_no: String(problemId) },
      select: { id: true },
    });

    if (!problem) return { error: "Tiket tidak ditemukan." };

    await db.problem.update({
      where: { id: problem.id },
      data: { status: Status.CLOSED },
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteBranchTicket(ticketId: number | string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie) {
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };
  }

  const sessionData = JSON.parse(sessionCookie.value);
  const userId = BigInt(sessionData.id);
  const userRole = sessionData.role?.toUpperCase();

  try {
    const isNumeric = /^\d+$/.test(String(ticketId));
    const problem = await db.problem.findFirst({
      where: isNumeric
        ? { OR: [{ id: BigInt(ticketId) }, { ticket_no: String(ticketId) }] }
        : { ticket_no: String(ticketId) },
      include: {
        problem_attachment: true,
        solution_attachment: true,
      },
    });

    if (!problem) {
      return { error: "Tiket tidak ditemukan." };
    }

    const bigTicketId = problem.id;

    // Hak akses: Pembuat tiket atau Admin
    if (userRole !== "ADMIN" && problem.created_by !== userId) {
      return { error: "Anda tidak memiliki akses untuk menghapus tiket ini." };
    }

    // Syarat utama: Tiket harus berstatus OPEN
    if (problem.status !== Status.OPEN) {
      return { error: "Tiket hanya dapat dihapus saat masih berstatus OPEN." };
    }

    // 1. Hapus file fisik lampiran dari storage
    const storageDir = process.env.STORAGE_PATH || "public/attachments";
    const usingSupabase = storageDir.startsWith("http://") || storageDir.startsWith("https://");

    if (usingSupabase) {
      // Untuk Supabase Storage, hapus via REST API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      // Gunakan service_role key (JWT) untuk delete — BUKAN anon key
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const bucketMatch = storageDir.match(/\/storage\/v1\/object\/public\/([^/]+)/);
      const bucket = bucketMatch?.[1];

      if (supabaseUrl && supabaseKey && bucket) {
        const allAttachments = [
          ...problem.problem_attachment.map(a => a.file_path),
          ...problem.solution_attachment.map(a => a.file_path),
        ].filter(Boolean) as string[];

        if (allAttachments.length > 0) {
          const deleteUrl = `${supabaseUrl}/storage/v1/object/${bucket}`;
          await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prefixes: allAttachments }),
          });
        }
      }
    } else {
      // Mode lokal: hapus file dari disk
      for (const att of problem.problem_attachment) {
        if (att.file_path) {
          const fullPath = path.isAbsolute(storageDir)
            ? path.join(storageDir, att.file_path)
            : path.join(process.cwd(), storageDir, att.file_path);
          try {
            await unlink(fullPath);
          } catch (err) {
            console.warn(`File lampiran tidak ditemukan atau gagal dihapus dari disk: ${fullPath}`, err);
          }
        }
      }

      for (const att of problem.solution_attachment) {
        if (att.file_path) {
          const fullPath = path.isAbsolute(storageDir)
            ? path.join(storageDir, att.file_path)
            : path.join(process.cwd(), storageDir, att.file_path);
          try {
            await unlink(fullPath);
          } catch (err) {
            console.warn(`File solusi tidak ditemukan atau gagal dihapus dari disk: ${fullPath}`, err);
          }
        }
      }
    }

    // 2. Hapus record terkait di database & record tiket
    await db.problem_attachment.deleteMany({ where: { problem_id: bigTicketId } });
    await db.solution_attachment.deleteMany({ where: { problem_id: bigTicketId } });
    await db.problem_eng.deleteMany({ where: { problem_id: bigTicketId } });

    await db.problem.delete({
      where: { id: bigTicketId },
    });

    return { success: true, message: "Tiket dan seluruh file lampiran berhasil dihapus dari sistem!" };
  } catch (error: any) {
    console.error("DEBUG ERROR DELETE TICKET:", error);
    return { error: error.message || "Terjadi kesalahan sistem saat menghapus tiket." };
  }
}
