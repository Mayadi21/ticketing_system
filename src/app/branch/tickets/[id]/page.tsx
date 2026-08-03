
// src/app/branch/tickets/[id]/page.tsx

import { db } from '@/lib/db';
import TicketDetailBranch from './TicketDetailBranch';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BranchTicketDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const ticketId = resolvedParams.id;

    try {
        const ticket = await db.problem.findUnique({
            where: { id: BigInt(ticketId) },
            include: {
                problem_attachment: true,
                solution_attachment: true,
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
            solutionNote: ticket.solution_note,
            status: ticket.status,
            priority: ticket.priority,
            createdAt: ticket.created_at.toISOString(),

            // Lampiran Masalah (Problem Attachments)
            problemAttachments: (ticket.problem_attachment || []).map((att) => ({
                id: att.id.toString(),
                url: att.file_path.startsWith('http') || att.file_path.startsWith('/') ? att.file_path : `/attachments/${att.file_path}`,
            })),

            // Lampiran Solusi (Solution Attachments)
            solutionAttachments: (ticket.solution_attachment || []).map((att) => ({
                id: att.id.toString(),
                url: att.file_path.startsWith('http') || att.file_path.startsWith('/') ? att.file_path : `/attachments/${att.file_path}`,
            })),
        };

        return <TicketDetailBranch ticketData={mappedTicketData} />;
    } catch (error) {
        console.error('Error fetching ticket detail:', error);
        return (
            <div className="flex min-h-screen items-center justify-center text-slate-500 font-sans">
                Terjadi kesalahan jaringan saat memuat tiket.
            </div>
        );
    }
}