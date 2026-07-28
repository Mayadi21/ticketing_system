import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import EngineerTicketTable, { Ticket } from '@/components/ticket/engineer/EngineerTicketTable';

export default async function EngineerTicketQueuePage() {
    const supabase = await createClient();

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('ticketing_session');

    if (!sessionCookie) {
        return (
            <div className="p-6 text-slate-500">
                Session tidak ditemukan. Silakan login kembali.
            </div>
        );
    }

    const session = JSON.parse(sessionCookie.value);
    const currentEngineerId = session.engineer_id || session.id; 

    // `created_at` dihapus dari query select Supabase karena pengurutan dilakukan penuh lewat deadline di client-side
    const { data: tickets, error } = await supabase
    .from('problem')
    .select(`
        id,
        ticket_no,
        title,
        status,
        priority,
        deadline,
        branch:affected_branch_id ( branch_name ),
        problem_eng!inner (
            engineer_id,
            assigned_at
        )
    `)
    .eq('problem_eng.engineer_id', currentEngineerId)
    .order('assigned_at', {
        foreignTable: 'problem_eng',
        ascending: false
    });

    if (error) {
        console.error('Error fetching engineer tickets:', error);
        return (
            <div className="p-6 text-red-500">
                Gagal memuat daftar ticket.
            </div>
        );
    }

    // Mapping hasil balikan Supabase ke dalam format interface Ticket
    const formattedTickets: Ticket[] = (tickets ?? []).map((ticket: any) => ({
        id: ticket.id,
        ticket_no: ticket.ticket_no,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        deadline: ticket.deadline,
        branch: Array.isArray(ticket.branch) ? ticket.branch[0] : ticket.branch,
    }));

    return (
        <div className="p-4 sm:p-8">
            <EngineerTicketTable tickets={formattedTickets} />
        </div>
    );
}