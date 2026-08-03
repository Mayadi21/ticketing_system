import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import TicketDetail from '@/app/admin/tickets/[id]/TicketDetailAdmin';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTicketDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const ticketId = resolvedParams.id;

  // Validasi Sesi
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('ticketing_session');

  if (!sessionCookie) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center text-white p-6">
        Session tidak ditemukan. Harap login kembali.
      </div>
    );
  }

  try {
    const isNumeric = /^\d+$/.test(ticketId);

    // 1. Ambil data detail tiket
    const ticket = await db.problem.findFirst({
      where: isNumeric
        ? { OR: [{ id: BigInt(ticketId) }, { ticket_no: ticketId }] }
        : { ticket_no: ticketId },
      include: {
        branch: {
          select: { branch_name: true },
        },
        user_problem_created_byTouser: {
          select: { name: true },
        },
        problem_attachment: true,
        problem_eng: {
          include: {
            user_problem_eng_engineer_idTouser: {
              select: { id: true, name: true },
            },
          },
        },
        solution_attachment: true,
      },
    });

    // 2. Ambil daftar semua opsi engineer
    const allEngineers = await db.user.findMany({
      where: { role: 'ENGINEER' },
      select: { id: true, name: true },
    });

    if (!ticket) {
      return (
        <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-white p-6 gap-4">
          <p className="text-red-400">Tiket tidak ditemukan.</p>
          <a href="/admin/tickets" className="px-4 py-2 bg-[#444f63] rounded-lg hover:bg-slate-600 transition">
            Kembali
          </a>
        </div>
      );
    }

    const formattedData = {
      id: Number(ticket.id),
      ticketNumber: ticket.ticket_no,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      deadline: ticket.deadline ? ticket.deadline.toISOString() : null,
      solution_note: ticket.solution_note || null,
      reportedBy: ticket.user_problem_created_byTouser?.name || 'Staff',
      branchLocation: ticket.branch ? `${ticket.branch.branch_name}` : 'Tidak Diketahui',
      createdAt: ticket.created_at.toISOString(),

      // Attachment Masalah
      attachments: (ticket.problem_attachment || []).map((att) => ({
        id: Number(att.id),
        url: att.file_path.startsWith('http') || att.file_path.startsWith('/') ? att.file_path : `/attachments/${att.file_path}`,
      })),

      // Attachment Solusi
      solution_attachments: (ticket.solution_attachment || []).map((att) => ({
        id: Number(att.id),
        file_path: att.file_path.startsWith('http') || att.file_path.startsWith('/') ? att.file_path : `/attachments/${att.file_path}`,
      })),

      assignedEngineers: (ticket.problem_eng || []).map((eng) => ({
        id: eng.user_problem_eng_engineer_idTouser ? Number(eng.user_problem_eng_engineer_idTouser.id) : null,
        name: eng.user_problem_eng_engineer_idTouser?.name,
      })),
    };

    const formattedEngineerOptions = allEngineers.map((eng) => ({
      id: Number(eng.id),
      name: eng.name,
    }));

    return <TicketDetail ticketData={formattedData} engineerOptions={formattedEngineerOptions} />;
  } catch (error) {
    console.error('Error fetching ticket detail:', error);
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-white p-6 gap-4">
        <p className="text-red-400">Gagal memuat detail tiket.</p>
        <a href="/admin/tickets" className="px-4 py-2 bg-[#444f63] rounded-lg hover:bg-slate-600 transition">
          Kembali
        </a>
      </div>
    );
  }
}