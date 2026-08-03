// src/app/engineer/tickets/[id]/page.tsx
import { db } from '@/lib/db';
import TicketDetail from './TicketDetailEngineer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EngineerTicketDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const ticketId = resolvedParams.id;

  try {
    const ticket = await db.problem.findUnique({
      where: { id: BigInt(ticketId) },
      include: {
        branch: true,
        user_problem_created_byTouser: true,
        problem_attachment: true,
        solution_attachment: true,
        problem_eng: {
          include: {
            user_problem_eng_engineer_idTouser: true,
          },
        },
      },
    });

    if (!ticket) {
      return (
        <div className="flex min-h-screen items-center justify-center text-slate-500 font-sans">
          Tiket tidak ditemukan.
        </div>
      );
    }

    const mappedTicketData = {
      id: ticket.id.toString(),
      ticketNumber: ticket.ticket_no,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      deadline: ticket.deadline ? ticket.deadline.toISOString() : null,
      reportedBy: ticket.user_problem_created_byTouser?.name || 'Sistem',
      branchLocation: ticket.branch
        ? `${ticket.branch.branch_name || ''} - ${ticket.branch.city_prov || ''}`.trim()
        : 'Tidak Diketahui',
      createdAt: ticket.created_at.toISOString(),

      attachments: (ticket.problem_attachment || []).map((att) => ({
        id: att.id.toString(),
        url: att.file_path.startsWith('http') || att.file_path.startsWith('/') ? att.file_path : `/attachments/${att.file_path}`,
      })),

      solutionNote: ticket.solution_note || null,
      solutionAttachments: (ticket.solution_attachment || []).map((att) => ({
        id: att.id.toString(),
        url: att.file_path.startsWith('http') || att.file_path.startsWith('/') ? att.file_path : `/attachments/${att.file_path}`,
      })),

      assignedEngineers: (ticket.problem_eng || []).map((eng) => ({
        id: eng.user_problem_eng_engineer_idTouser.id.toString(),
        name: eng.user_problem_eng_engineer_idTouser.name,
      })),
    };

    return <TicketDetail ticketData={mappedTicketData} />;
  } catch (error) {
    console.error('Error fetching engineer ticket detail:', error);
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500 font-sans">
        Gagal memuat detail tiket.
      </div>
    );
  }
}