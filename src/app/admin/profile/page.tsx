import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import ProfileView, { UserProfileData } from '@/components/profile/ProfileView';

interface SessionData {
  id: number | string;
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

  const userData = await db.user.findUnique({
    where: { id: BigInt(sessionData.id) },
    include: {
      branch: { select: { branch_name: true } },
    },
  });

  if (!userData) {
    return (
      <div className="p-8 text-center text-red-600">
        Gagal memuat data profil. Silakan coba login kembali.
      </div>
    );
  }

  const imagePath = userData.image
    ? (userData.image.startsWith('http') || userData.image.startsWith('/')
        ? userData.image
        : `/attachments/${userData.image}`)
    : null;

  const combinedUserData: UserProfileData = {
    id: userData.id.toString(),
    email: userData.email,
    employee_id: userData.id.toString(),
    full_name: userData.name,
    phone: userData.phone || "-",
    role: userData.role,
    image: imagePath,
    branch_name: userData.branch?.branch_name || null,
    location: null,
  };

  return <ProfileView userData={combinedUserData} />;
}