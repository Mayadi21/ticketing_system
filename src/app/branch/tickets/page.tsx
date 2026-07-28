// src/app/branch/tickets/page.tsx

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import BranchTicketTable from '@/components/ticket/branch/BranchTicketTable';

export default async function BranchTicketQueuePage() {
  const supabase = await createClient();

  // 1. Ambil Session dari Cookies
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

  // 2. Fetch data sesuai branch_id
const { data: tickets, error } = await supabase
    .from('problem')
    .select(`
      id,
      ticket_no,
      title,
      status,
      priority,
      created_at
    `)
    .eq('affected_branch_id', session.branch_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching branch tickets:', error);
    return (
      <div className="p-6 text-red-500 font-medium text-center">
        Gagal memuat daftar ticket.
      </div>
    );
  }

  // 3. Format data (tipe dibiarkan dinamis menyesuaikan interface di komponen)
  const formattedTickets = (tickets ?? []).map((ticket: any) => ({
    id: ticket.id,
    ticket_no: ticket.ticket_no,
    title: ticket.title,
    priority: ticket.priority,
    status: ticket.status,
    created_at: ticket.created_at
  }));

  // 4. Render ke Komponen Spesifik Branch
  return <BranchTicketTable tickets={formattedTickets} />;
}