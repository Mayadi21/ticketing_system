import { getSuperAdminUsers } from '@/app/actions/superadmin';
import UserManagementView from './UserManagementView';

export default async function SuperAdminUsersPage() {
  const data = await getSuperAdminUsers();

  if ('error' in data && data.error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <p className="font-bold">Gagal memuat data user</p>
        <p className="text-sm">{data.error}</p>
      </div>
    );
  }

  return (
    <UserManagementView
      initialUsers={data.users || []}
      branches={data.branches || []}
    />
  );
}
