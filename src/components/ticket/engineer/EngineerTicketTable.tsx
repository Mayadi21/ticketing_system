'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Filter, Search } from 'lucide-react';
import BaseTable, { ColumnDef } from '../BaseTable';

export interface Ticket {
    id: number;
    ticket_no: string;
    title: string;
    status: string;
    priority?: string;
    deadline?: string;
    branch?: { branch_name: string };
}
import { formatLongDateTimeWIB } from '@/utils/date';


interface EngineerTicketTableProps {
    tickets: Ticket[];
}

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'OPEN': return { badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-600', text: 'Open' };
        case 'ASSIGNED': return { badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-600', text: 'Assigned' };
        case 'IN_PROGRESS': return { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', text: 'In Progress' };
        case 'RESOLVED': return { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', text: 'Resolved' };
        case 'CLOSED': return { badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500', text: 'Closed' };
        default: return { badge: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500', text: status };
    }
};

export default function EngineerTicketTable({ tickets }: EngineerTicketTableProps) {
    // 1. STATE UNTUK KONTROL (SEARCH & FILTER)
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // 2. STATE UNTUK PAGINATION DINAMIS
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset pagination ke halaman 1 jika filter atau pencarian berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // 3. LOGIKA FILTER, SEARCH, & SORTING OTOMATIS (DEADLINE TERDEKAT)
    const processedTickets = useMemo(() => {
        let result = [...tickets];

        // Fitur Pencarian (Ticket No, Judul / Issue Summary)
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (ticket) =>
                    ticket.ticket_no.toLowerCase().includes(query) ||
                    ticket.title.toLowerCase().includes(query)
            );
        }

        // Fitur Filter Status
        if (statusFilter !== 'ALL') {
            result = result.filter((ticket) => ticket.status === statusFilter);
        }

        // Kunci Logika: Otomatis mengurutkan dari deadline terdekat ke terjauh
        // Jika tiket tidak memiliki deadline, ditaruh di paling bawah (Infinity)
        result.sort((a, b) => {
            const timeA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const timeB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
            return timeA - timeB;
        });

        return result;
    }, [tickets, searchQuery, statusFilter]);

    const getDeadlineColor = (deadline?: string, status?: string) => {
    if (!deadline) return 'text-slate-400';
    
    // Jika tiket sudah selesai/ditutup, gunakan warna netral agar tidak terlihat menakutkan (merah)
    if (status === 'RESOLVED' || status === 'CLOSED') {
        return 'text-slate-500';
    }

    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const timeDiff = deadlineTime - now;
    
    // Konversi milidetik ke jam
    const hoursLeft = timeDiff / (1000 * 60 * 60);

    if (hoursLeft < 0) {
        return 'text-red-600 font-bold'; // Terlewat (Overdue)
    } else if (hoursLeft <= 24) {
        return 'text-amber-600 font-bold'; // Tersisa < 24 Jam (Warning)
    } else if (hoursLeft <= 72) {
        return 'text-blue-600 font-medium'; // Tersisa < 3 Hari (Mendekati)
    } else {
        return 'text-emerald-600 font-medium'; // Masih lama (Aman)
    }
};

    // 4. LOGIKA PEMOTONGAN DATA (SLICING) PER HALAMAN
    const totalItems = processedTickets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const paginatedTickets = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return processedTickets.slice(startIndex, endIndex);
    }, [processedTickets, currentPage, itemsPerPage]);

    // 5. DEFINISI KOLOM TABEL
    const columns: ColumnDef<Ticket>[] = [
        {
            header: 'No. Tiket',
            cell: (ticket) => (
                <Link
                    href={`/engineer/tickets/${ticket.id}`}
                    className="font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
                >
                    {ticket.ticket_no}
                </Link>
            ),
        },
        {
            header: 'Bank Cabang',
            cell: (ticket) => <span className="font-medium text-slate-800">{ticket.branch?.branch_name ?? '-'}</span>,
        },
        {
            header: 'Masalah',
            className: 'min-w-[250px]',
            cell: (ticket) => <span className="text-slate-600 max-w-[250px] truncate block">{ticket.title}</span>,
        },
{
            header: 'Deadline',
            cell: (ticket) => (
                <span className={getDeadlineColor(ticket.deadline, ticket.status)}>
                    {ticket.deadline ? formatLongDateTimeWIB(ticket.deadline) : '-'}
                </span>
            ),
        },
        {
            header: 'Status',
            cell: (ticket) => {
                const status = getStatusStyle(ticket.status);
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${status.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.text}
                    </span>
                );
            },
        },
        {
            header: 'Prioritas',
            cell: (ticket) => (
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                    ticket.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200'
                    : ticket.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                    {ticket.priority ?? '-'}
                </span>
            ),
        },
    ];

    // 6. PANEL AKSI (INPUT SEARCH & FILTER STATUS) - TANPA TOMBOL CREATE / SORT DROPDOWN
    const engineerActions = (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari No. Tiket dan Masalah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
            </div>

            <div className="relative flex items-center bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2 hover:bg-slate-50 transition-colors">
                <Filter size={16} className="text-slate-500 mr-2" />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer pr-4"
                >
                    <option value="ALL">All Status</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>
        </div>
    );

    // 7. OPER DATA KE BASE TABLE
    return (
        <BaseTable 
            title="Daftar Tiket"
            columns={columns}
            data={paginatedTickets}
            actions={engineerActions}
            emptyMessage={
                searchQuery || statusFilter !== 'ALL'
                    ? "Tidak ada tiket yang sesuai dengan filter pencarian Anda."
                    : "Anda tidak memiliki tiket yang ditugaskan saat ini."
            }
            pagination={{
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                onPageChange: setCurrentPage
            }}
        />
    );
}