import { db } from '@/lib/db';
import BranchList from '@/components/branch/BranchList';

export default async function AdminBranchesPage() {
  try {
    const branches = await db.branch.findMany({
      orderBy: { branch_code: 'asc' },
    });

    const serializedBranches = branches.map((b) => ({
      ...b,
      id: Number(b.id),
    }));

    return <BranchList initialBranches={serializedBranches} />;
  } catch (error) {
    console.error('Error fetching branches:', error);
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
        Gagal memuat data kantor cabang. Silakan coba muat ulang halaman.
      </div>
    );
  }
}