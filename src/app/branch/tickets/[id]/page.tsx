
  // src/app/branch/tickets/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';

import TicketDetailBranch from './TicketDetailBranch';

interface PageProps {
    params: Promise<{ id: string }>;
}



export default async function BranchTicketDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const ticketId = resolvedParams.id;
    const supabase = await createClient();


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

    // 2. Transformasi data sesuai kebutuhan Branch
    const mappedTicketData = {
        id: ticket.id,
        ticketNumber: ticket.ticket_no,
        title: ticket.title,
        description: ticket.description,
        solutionNote: ticket.solution_note,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,

        // Lampiran Masalah (Problem Attachments)
        problemAttachments: (ticket.problem_attachments || []).map((att: any) => ({
            id: att.id,
            url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${att.file_path}`
        })),

        // Lampiran Solusi (Solution Attachments)
        solutionAttachments: (ticket.solution_attachments || []).map((att: any) => ({
            id: att.id,
            url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${att.file_path}`
        }))
    };

    // 3. Kirim data ke komponen UI Branch
    return <TicketDetailBranch ticketData={mappedTicketData} />;
}