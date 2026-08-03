// src/app/admin/tickets/page.tsx

import { db } from '@/lib/db';
import AdminTicketTable from '@/components/ticket/admin/AdminTicketTable';

export default async function AdminTicketQueuePage() {
  try {
    const tickets = await db.problem.findMany({
      include: {
        branch: {
          select: {
            branch_name: true,
          },
        },
        problem_eng: {
          include: {
            user_problem_eng_engineer_idTouser: {
              select: {
                name: true,
              },
            },
          },
        },
        solution_attachment: {
          select: {
            id: true,
            file_path: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const formattedTickets = tickets.map((ticket) => ({
      id: Number(ticket.id),
      ticket_no: ticket.ticket_no,
      title: ticket.title,
      status: ticket.status,
      created_at: ticket.created_at.toISOString(),
      priority: ticket.priority,

      solution_note: ticket.solution_note || null,
      solution_attachments: ticket.solution_attachment.map((sa) => ({
        id: Number(sa.id),
        file_path: sa.file_path,
      })),

      branch: {
        branch_name: ticket.branch?.branch_name ?? '-',
      },

      problem_eng: ticket.problem_eng.map((eng) => ({
        engineer: {
          name: eng.user_problem_eng_engineer_idTouser?.name ?? '',
        },
      })),
    }));

    return <AdminTicketTable tickets={formattedTickets} />;
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return <AdminTicketTable tickets={[]} />;
  }
}