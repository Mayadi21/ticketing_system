import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ProfileView, { UserProfileData } from '@/components/profile/ProfileView';

interface SessionData {
  id: string;
}

export default async function AdminProfilePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('ticketing_session')?.value;

  if (!sessionCookie) {
    redirect('/'); 
  }

  let sessionData: SessionData;
  try {
    sessionData = JSON.parse(sessionCookie);
  } catch (error) {
    redirect('/');
  }

  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase
    .from('user')
    .select(`
      *,
      branch:branch_id (branch_name)
    `)
    .eq('id', sessionData.id)
    .single();

  if (userError || !userData) {
    return (
      <div className="p-8 text-center text-red-600">
        Gagal memuat data profil. Silakan coba login kembali.
      </div>
    );
  }

  // Pemetaan data: Hapus fallback string agar jika kosong, nilainya menjadi null
const combinedUserData: UserProfileData = {
  id: userData.id,
  email: userData.email,
  employee_id: userData.id,
  full_name: userData.name,
  phone: userData.phone || "-",
  role: userData.role,

  image: userData.image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${userData.image}`
    : null,

  branch_name: (userData.branch as any)?.branch_name || null,
  location: userData.location || null,
};

  return <ProfileView userData={combinedUserData} />;
}