
// src/app/branch/tickets/[id]/page.tsx

import { db } from '@/lib/db';
import TicketDetailBranch from './TicketDetailBranch';

function resolveAttachmentUrl(filePath: string): string {
  if (filePath.startsWith('http') || filePath.startsWith('/')) return filePath;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/attachments/${filePath}`;
  }
  return `/attachments/${filePath}`;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BranchTicketDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const ticketId = resolvedParams.id;

    try {
        const isNumeric = /^\d+$/.test(ticketId);
        const ticket = await db.problem.findFirst({
            where: isNumeric
                ? { OR: [{ id: BigInt(ticketId) }, { ticket_no: ticketId }] }
                : { ticket_no: ticketId },
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
                url: resolveAttachmentUrl(att.file_path),
            })),

            // Lampiran Solusi (Solution Attachments)
            solutionAttachments: (ticket.solution_attachment || []).map((att) => ({
                id: att.id.toString(),
                url: resolveAttachmentUrl(att.file_path),
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