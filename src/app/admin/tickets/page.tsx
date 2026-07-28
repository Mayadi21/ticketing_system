// src/app/admin/tickets/page.tsx

import { createClient } from '@/utils/supabase/server';
import AdminTicketTable from '@/components/ticket/admin/AdminTicketTable';

export default async function AdminTicketQueuePage() {
  const supabase = await createClient();

  const { data: tickets, error } = await supabase
    .from('problem')
    .select(`
      id,
      ticket_no,
      title,
      status,
      created_at,
      priority,
      solution_note,
      branch:affected_branch_id (
        branch_name
      ),
      problem_eng (
        engineer:user!fk_problem_eng_engineer (
          name
        )
      ),
      solution_attachment (
        id,
        file_path
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
  }

  const formattedTickets = (tickets ?? []).map((ticket: any) => ({
    id: ticket.id,
    ticket_no: ticket.ticket_no,
    title: ticket.title,
    status: ticket.status,
    created_at: ticket.created_at,
    priority: ticket.priority,
    
    solution_note: ticket.solution_note || null,
    solution_attachments: ticket.solution_attachment || [],

    branch: {
      branch_name:
        ticket.branch?.branch_name ??
        ticket.branch?.[0]?.branch_name ??
        '-',
    },

    problem_eng:
      ticket.problem_eng?.map((eng: any) => ({
        engineer: {
          name:
            eng.engineer?.name ??
            eng.engineer?.[0]?.name ??
            '',
        },
      })) ?? [],
  }));

  return <AdminTicketTable tickets={formattedTickets} />;
}