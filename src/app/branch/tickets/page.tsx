// src/app/branch/tickets/page.tsx

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import BranchTicketTable from '@/components/ticket/branch/BranchTicketTable';

export default async function BranchTicketQueuePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('ticketing_session');

  if (!sessionCookie) {
    return (
      <div className="p-6 text-slate-500 font-medium text-center">
        Session tidak ditemukan. Silakan login kembali.
      </div>
    );
  }

  const session = JSON.parse(sessionCookie.value);
  if (!session.branch_id) {
    return (
      <div className="p-6 text-red-500 font-medium text-center">
        Gagal memuat daftar ticket. Cabang tidak teridentifikasi.
      </div>
    );
  }

  try {
    const tickets = await db.problem.findMany({
      where: {
        affected_branch_id: BigInt(session.branch_id),
      },
      select: {
        id: true,
        ticket_no: true,
        title: true,
        status: true,
        priority: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const formattedTickets = tickets.map((ticket) => ({
      id: Number(ticket.id),
      ticket_no: ticket.ticket_no,
      title: ticket.title,
      priority: ticket.priority,
      status: ticket.status,
      created_at: ticket.created_at.toISOString(),
    }));

    return <BranchTicketTable tickets={formattedTickets} />;
  } catch (error) {
    console.error('Error fetching branch tickets:', error);
    return (
      <div className="p-6 text-red-500 font-medium text-center">
        Gagal memuat daftar ticket.
      </div>
    );
  }
}