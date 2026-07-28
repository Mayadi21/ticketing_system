import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import TicketDetail from '@/app/admin/tickets/[id]/TicketDetailAdmin'; 

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTicketDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const ticketId = resolvedParams.id;
  const supabase = await createClient();

  // Validasi Sesi
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('ticketing_session');

  if (!sessionCookie) {
    return (
      <div className="min-h-screen bg-[#384152] flex items-center justify-center text-white p-6">
        Session tidak ditemukan. Harap login kembali.
      </div>
    );
  }

  // 1. Ambil data detail tiket
  const { data: ticket, error: ticketError } = await supabase
    .from('problem')
    .select(`
      id,
      ticket_no,
      title,
      description,
      status,
      priority,
      created_at,
      deadline,
      solution_note, 
      branch ( branch_name),
      creator:user!fk_problem_creator ( name ),
      problem_attachment ( id, file_path ),
      problem_eng (
        id,
        engineer_id,
        engineer:user!fk_problem_eng_engineer ( id, name )
      ), 
      solution_attachment ( id, file_path )
    `)
    .eq('id', ticketId)
    .maybeSingle();

  // 2. Ambil daftar semua opsi engineer
  const { data: allEngineers } = await supabase
    .from('user')
    .select('id, name')
    .eq('role', 'ENGINEER');

  if (ticketError || !ticket) {
    console.error('Error fetching ticket detail:', ticketError);
    return (
      <div className="min-h-screen bg-[#384152] flex flex-col items-center justify-center text-white p-6 gap-4">
        <p className="text-red-400">Gagal memuat detail tiket.</p>
        <a href="/admin/tickets" className="px-4 py-2 bg-[#444f63] rounded-lg hover:bg-slate-600 transition">
          Kembali
        </a>
      </div>
    );
  }

  const anyTicket = ticket as any;

  // PERBAIKAN: Menambahkan mapping untuk solution_note & solution_attachment
  const formattedData = {
    id: anyTicket.id,
    ticketNumber: anyTicket.ticket_no,
    title: anyTicket.title,
    description: anyTicket.description,
    status: anyTicket.status,
    priority: anyTicket.priority,
    deadline: anyTicket.deadline,
    solution_note: anyTicket.solution_note || null, // <-- TAMBAHAN
    reportedBy: anyTicket.creator?.name || 'Staff',
    branchLocation: anyTicket.branch ? `${anyTicket.branch.branch_name}` : 'Tidak Diketahui',
    createdAt: anyTicket.created_at,
    
    // Attachment Masalah
    attachments: (anyTicket.problem_attachment || []).map((att: any) => ({
      id: att.id,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${att.file_path}` 
    })),
    
    // Attachment Solusi
    solution_attachments: (anyTicket.solution_attachment || []).map((att: any) => ({ // <-- TAMBAHAN
      id: att.id,
      // Gunakan URL lengkap agar bisa langsung diakses melalui tag <a> di klien
      file_path: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${att.file_path}` 
    })),
    
    assignedEngineers: (anyTicket.problem_eng || []).map((eng: any) =>  ({
      id: eng.engineer?.id,
      name: eng.engineer?.name
    }))
  };

  return <TicketDetail ticketData={formattedData} engineerOptions={allEngineers || []} />;
}