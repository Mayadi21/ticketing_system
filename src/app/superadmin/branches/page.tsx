import { getSuperAdminBranches } from '@/app/actions/superadmin';
import BranchManagementView from './BranchManagementView';

export default async function SuperAdminBranchesPage() {
  const data = await getSuperAdminBranches();

  if ('error' in data && data.error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <p className="font-bold">Gagal memuat data cabang bank</p>
        <p className="text-sm">{data.error}</p>
      </div>
    );
  }

  return <BranchManagementView initialBranches={data.branches || []} />;
}
