"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Helper internal untuk verifikasi bahwa pemanggil action adalah SUPER_ADMIN & ACTIVE
async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ticketing_session");

  if (!sessionCookie) {
    return { error: "Sesi tidak ditemukan. Silakan login ulang." };
  }

  const sessionData = JSON.parse(sessionCookie.value);
  const userId = BigInt(sessionData.id);

  const currentUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });

  if (!currentUser || currentUser.status !== "ACTIVE" || currentUser.role !== "SUPER_ADMIN") {
    return { error: "Akses ditolak. Fitur ini hanya untuk Super Admin." };
  }

  return { userId };
}

// ==========================================
// 1. MANAGEMENT CABANG BANK (BRANCH CRUD)
// ==========================================

export async function getSuperAdminBranches() {
  const auth = await verifySuperAdmin();
  if ("error" in auth) return { error: auth.error, branches: [] };

  try {
    const branches = await db.branch.findMany({
      orderBy: { branch_name: "asc" },
      include: {
        _count: {
          select: { user: true, problem: true },
        },
      },
    });

    const formattedBranches = branches.map((b) => ({
      id: Number(b.id),
      branch_name: b.branch_name,
      address: b.address,
      city_prov: b.city_prov,
      phone: b.phone || "",
      zip_code: b.zip_code || "",
      branch_code: b.branch_code,
      userCount: b._count.user,
      problemCount: b._count.problem,
    }));

    return { branches: formattedBranches };
  } catch (error: any) {
    console.error("Error getSuperAdminBranches:", error);
    return { error: "Gagal mengambil data cabang.", branches: [] };
  }
}

export async function createBranch(formData: FormData) {
  const auth = await verifySuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const branch_name = (formData.get("branch_name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const city_prov = (formData.get("city_prov") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const zip_code = (formData.get("zip_code") as string)?.trim() || null;
  const branch_code = (formData.get("branch_code") as string)?.trim()?.toUpperCase();

  if (!branch_name || !address || !city_prov || !branch_code) {
    return { error: "Nama cabang, alamat, kota/provinsi, dan kode cabang wajib diisi." };
  }

  if (branch_code.length !== 3) {
    return { error: "Kode cabang harus terdiri dari 3 karakter unik." };
  }

  try {
    const existingCode = await db.branch.findUnique({
      where: { branch_code },
    });

    if (existingCode) {
      return { error: `Kode cabang '${branch_code}' sudah digunakan oleh cabang lain.` };
    }

    await db.branch.create({
      data: {
        branch_name,
        address,
        city_prov,
        phone,
        zip_code,
        branch_code,
      },
    });

    revalidatePath("/superadmin/branches");
    return { success: true, message: "Cabang bank berhasil ditambahkan." };
  } catch (error: any) {
    console.error("Error createBranch:", error);
    return { error: error.message || "Terjadi kesalahan sistem saat membuat cabang." };
  }
}

export async function updateBranch(formData: FormData) {
  const auth = await verifySuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const idStr = formData.get("id") as string;
  const branch_name = (formData.get("branch_name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const city_prov = (formData.get("city_prov") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const zip_code = (formData.get("zip_code") as string)?.trim() || null;
  const branch_code = (formData.get("branch_code") as string)?.trim()?.toUpperCase();

  if (!idStr || !branch_name || !address || !city_prov || !branch_code) {
    return { error: "Data cabang tidak lengkap." };
  }

  if (branch_code.length !== 3) {
    return { error: "Kode cabang harus 3 karakter." };
  }

  const branchId = BigInt(idStr);

  try {
    const existingCode = await db.branch.findFirst({
      where: {
        branch_code,
        NOT: { id: branchId },
      },
    });

    if (existingCode) {
      return { error: `Kode cabang '${branch_code}' sudah dipakai oleh cabang lain.` };
    }

    await db.branch.update({
      where: { id: branchId },
      data: {
        branch_name,
        address,
        city_prov,
        phone,
        zip_code,
        branch_code,
      },
    });

    revalidatePath("/superadmin/branches");
    return { success: true, message: "Data cabang berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error updateBranch:", error);
    return { error: error.message || "Gagal memperbarui cabang." };
  }
}

export async function deleteBranch(branchId: number | string) {
  const auth = await verifySuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const bigId = BigInt(branchId);

  try {
    // Cek keterikatan user atau tiket pada cabang ini
    const userCount = await db.user.count({ where: { branch_id: bigId } });
    const problemCount = await db.problem.count({ where: { affected_branch_id: bigId } });

    if (userCount > 0 || problemCount > 0) {
      return {
        error: `Cabang tidak dapat dihapus karena masih terhubung dengan ${userCount} user dan ${problemCount} tiket.`,
      };
    }

    await db.branch.delete({ where: { id: bigId } });

    revalidatePath("/superadmin/branches");
    return { success: true, message: "Cabang bank berhasil dihapus." };
  } catch (error: any) {
    console.error("Error deleteBranch:", error);
    return { error: error.message || "Gagal menghapus cabang." };
  }
}

// ==========================================
// 2. MANAGEMENT USER (USER CRUD)
// ==========================================

export async function getSuperAdminUsers() {
  const auth = await verifySuperAdmin();
  if ("error" in auth) return { error: auth.error, users: [], branches: [] };

  try {
    const users = await db.user.findMany({
      orderBy: { name: "asc" },
      include: {
        branch: {
          select: { id: true, branch_name: true, branch_code: true },
        },
      },
    });

    const branches = await db.branch.findMany({
      orderBy: { branch_name: "asc" },
      select: { id: true, branch_name: true, branch_code: true },
    });

    const formattedUsers = users.map((u) => ({
      id: Number(u.id),
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      phone: u.phone || "",
      branch_id: u.branch_id ? Number(u.branch_id) : null,
      branch_name: u.branch ? u.branch.branch_name : "-",
    }));

    const formattedBranches = branches.map((b) => ({
      id: Number(b.id),
      branch_name: b.branch_name,
      branch_code: b.branch_code,
    }));

    return { users: formattedUsers, branches: formattedBranches };
  } catch (error: any) {
    console.error("Error getSuperAdminUsers:", error);
    return { error: "Gagal mengambil data user.", users: [], branches: [] };
  }
}

export async function createUser(formData: FormData) {
  const auth = await verifySuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim()?.toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as "ADMIN" | "BRANCH" | "ENGINEER" | "SUPER_ADMIN";
  const branch_id = formData.get("branch_id") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const status = (formData.get("status") as "ACTIVE" | "NON_ACTIVE") || "ACTIVE";

  if (!name || !email || !password || !role) {
    return { error: "Nama, email, password, dan role wajib diisi." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Alamat email tidak valid. Harap masukkan email nyata yang aktif untuk pengiriman notifikasi." };
  }

  if (role === "BRANCH" && !branch_id) {
    return { error: "User dengan role BRANCH wajib memilih cabang bank." };
  }

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: `Email '${email}' sudah digunakan oleh user lain.` };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status,
        phone,
        branch_id: branch_id ? BigInt(branch_id) : null,
      },
    });

    revalidatePath("/superadmin/users");
    return { success: true, message: "User baru berhasil dibuat." };
  } catch (error: any) {
    console.error("Error createUser:", error);
    return { error: error.message || "Gagal membuat user." };
  }
}

export async function updateUser(formData: FormData) {
  const auth = await verifySuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const idStr = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim()?.toLowerCase();
  const role = formData.get("role") as "ADMIN" | "BRANCH" | "ENGINEER" | "SUPER_ADMIN";
  const branch_id = formData.get("branch_id") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const status = (formData.get("status") as "ACTIVE" | "NON_ACTIVE") || "ACTIVE";

  if (!idStr || !name || !email || !role) {
    return { error: "Data user tidak lengkap." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Alamat email tidak valid. Harap masukkan email nyata yang aktif untuk pengiriman notifikasi." };
  }

  const userId = BigInt(idStr);

  try {
    const existingEmail = await db.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });

    if (existingEmail) {
      return { error: `Email '${email}' sudah digunakan oleh user lain.` };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
        status,
        phone,
        branch_id: branch_id ? BigInt(branch_id) : null,
      },
    });

    revalidatePath("/superadmin/users");
    return { success: true, message: "Data user berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error updateUser:", error);
    return { error: error.message || "Gagal memperbarui user." };
  }
}

export async function resetUserPassword(formData: FormData) {
  const auth = await verifySuperAdmin();
  if ("error" in auth) return { error: auth.error };

  const userIdStr = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!userIdStr || !newPassword || newPassword.length < 6) {
    return { error: "Password baru minimal 6 karakter." };
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: BigInt(userIdStr) },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password user berhasil direset." };
  } catch (error: any) {
    console.error("Error resetUserPassword:", error);
    return { error: error.message || "Gagal mereset password user." };
  }
}

export async function toggleUserStatus(userId: number | string, newStatus: "ACTIVE" | "NON_ACTIVE") {
  const auth = await verifySuperAdmin();
  if ("error" in auth) return { error: auth.error };

  try {
    await db.user.update({
      where: { id: BigInt(userId) },
      data: { status: newStatus },
    });

    revalidatePath("/superadmin/users");
    return {
      success: true,
      message: `Status user berhasil diubah menjadi ${newStatus === "ACTIVE" ? "Aktif" : "Non-Aktif"}.`,
    };
  } catch (error: any) {
    console.error("Error toggleUserStatus:", error);
    return { error: error.message || "Gagal mengubah status user." };
  }
}
