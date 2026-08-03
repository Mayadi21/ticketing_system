import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import EngineerTicketTable, { Ticket } from '@/components/ticket/engineer/EngineerTicketTable';

export default async function EngineerTicketQueuePage() {
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
    const currentEngineerId = BigInt(session.engineer_id || session.id);

    try {
        const problemEngList = await db.problem_eng.findMany({
            where: { engineer_id: currentEngineerId },
            include: {
                problem: {
                    include: {
                        branch: { select: { branch_name: true } },
                    },
                },
            },
            orderBy: { assigned_at: 'desc' },
        });

        const formattedTickets: Ticket[] = problemEngList.map((pe) => ({
            id: Number(pe.problem.id),
            ticket_no: pe.problem.ticket_no,
            title: pe.problem.title,
            status: pe.problem.status,
            priority: pe.problem.priority,
            deadline: pe.problem.deadline ? pe.problem.deadline.toISOString() : undefined,
            branch: pe.problem.branch ? { branch_name: pe.problem.branch.branch_name } : { branch_name: '-' },
        }));

        return (
            <div className="p-4 sm:p-8">
                <EngineerTicketTable tickets={formattedTickets} />
            </div>
        );
    } catch (error) {
        console.error('Error fetching engineer tickets:', error);
        return (
            <div className="p-6 text-red-500">
                Gagal memuat daftar ticket.
            </div>
        );
    }
}