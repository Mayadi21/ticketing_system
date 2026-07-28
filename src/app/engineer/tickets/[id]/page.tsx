// src/app/engineer/tickets/[id]/page.tsx
import { createClient } from '@supabase/supabase-js'; // Sesuaikan dengan setup utilitas Supabase Anda
import TicketDetail from './TicketDetailEngineer';

interface PageProps {
  params: Promise<{ id: string }>;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function EngineerTicketDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const ticketId = resolvedParams.id;

  // 1. Jalankan kueri tunggal ke View PostgreSQL
  const { data: ticket, error: ticketError } = await supabase
    .from('v_problem_detail')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (ticketError || !ticket) {
    console.error('Error fetching ticket:', ticketError);
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500 font-sans">
        Tiket tidak ditemukan atau terjadi kesalahan jaringan.
      </div>
    );
  }

  // 2. Transformasi data dari View ke properti yang dibutuhkan UI
  const mappedTicketData = {
    id: ticket.id,
    ticketNumber: ticket.ticket_no,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    deadline: ticket.deadline,
    reportedBy: ticket.creator_name || 'Sistem',
    branchLocation: `${ticket.branch_name || ''} - ${ticket.city_prov || ''}`.trim(),
    createdAt: ticket.created_at,

    // Mengambil data lampiran masalah dari agregasi JSON di View
    attachments: (ticket.problem_attachments || []).map((att: any) => ({
      id: att.id,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${att.file_path}`
    })),

    // PENAMBAHAN: Mengambil catatan solusi dan lampiran solusi
    solutionNote: ticket.solution_note || null,
    solutionAttachments: (ticket.solution_attachments || []).map((att: any) => ({
      id: att.id,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${att.file_path}`
    })),

    // Mengambil engineer yang ditugaskan langsung dari agregasi JSON di View
    assignedEngineers: (ticket.engineers || []).map((eng: any) => ({
      id: eng.engineer_id,
      name: eng.name
    }))
  };

  // 3. Kirim data ke komponen TicketDetail tanpa properti engineerOptions
  return <TicketDetail ticketData={mappedTicketData} />;
}