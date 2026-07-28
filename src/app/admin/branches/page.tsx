import { createClient } from '@/utils/supabase/server';
import BranchList from '@/components/branch/BranchList';

export default async function AdminBranchesPage() {
  // Inisialisasi Supabase sisi server
  const supabase = await createClient();

  // Mengambil seluruh data cabang, diurutkan berdasarkan kode cabang
  const { data: branches, error } = await supabase
    .from('branch')
    .select('*')
    .order('branch_code', { ascending: true });

  // Handle jika terjadi error saat fetch data
  if (error) {
    console.error('Error fetching branches:', error);
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
        Gagal memuat data kantor cabang. Silakan coba muat ulang halaman.
      </div>
    );
  }

  // Lempar data asli dari database ke Client Component
  return <BranchList initialBranches={branches || []} />;
}