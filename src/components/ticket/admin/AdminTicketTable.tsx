// src/components/ticket/admin/AdminTicketTable.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Filter, ArrowUpDown, PlusCircle, Search } from 'lucide-react';
import BaseTable, { ColumnDef } from '../BaseTable';
import { formatLongDateTimeWIB } from '@/utils/date';

export interface Engineer {
    engineer?: { name: string };
}

export interface Ticket {
    id: number;
    ticket_no: string;
    title: string;
    status: string;
    priority?: string;
    created_at: string;
    branch?: { branch_name: string };
    problem_eng?: Engineer[];
}

interface AdminTicketTableProps {
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

export default function AdminTicketTable({ tickets }: AdminTicketTableProps) {
    // 1. STATE UNTUK CONTROL
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOption, setSortOption] = useState('newest'); // default: newest

    // STATE UNTUK PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Jumlah baris yang ingin ditampilkan per halaman

    // Reset pagination ke halaman 1 setiap kali query search, filter, atau sort berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, sortOption]);

    // Bobot nilai untuk tingkatan prioritas
    const priorityWeight: Record<string, number> = {
        'HIGH': 3,
        'MEDIUM': 2,
        'LOW': 1
    };

    // 2. LOGIKA UTAMA: SEARCH, FILTER, & SORTING (SELURUH DATA)
    const processedTickets = useMemo(() => {
        let result = [...tickets];

        // Jalankan Fitur Pencarian
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (ticket) =>
                    ticket.ticket_no.toLowerCase().includes(query) ||
                    ticket.title.toLowerCase().includes(query)
            );
        }

        // Jalankan Fitur Filter Status
        if (statusFilter !== 'ALL') {
            result = result.filter((ticket) => ticket.status === statusFilter);
        }

        // Jalankan Fitur Pengurutan (Sorting)
        result.sort((a, b) => {
            if (sortOption === 'newest' || sortOption === 'oldest') {
                const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return sortOption === 'newest' ? timeB - timeA : timeA - timeB;
            }

            if (sortOption === 'priority-high') {
                const weightA = priorityWeight[a.priority ?? ''] ?? 0;
                const weightB = priorityWeight[b.priority ?? ''] ?? 0;
                return weightB - weightA;
            }

            return 0;
        });

        return result;
    }, [tickets, searchQuery, statusFilter, sortOption]);

    // 3. LOGIKA PAGINATION (MEMOTONG DATA UNTUK HALAMAN SAAT INI)
    const totalItems = processedTickets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Potong array berdasarkan halaman aktif
    const paginatedTickets = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return processedTickets.slice(startIndex, endIndex);
    }, [processedTickets, currentPage, itemsPerPage]);

    // 4. DEFINISI KOLOM UNTUK BASE TABLE
    const columns: ColumnDef<Ticket>[] = [
        {
            header: 'No. Tiket',
            cell: (ticket) => (
                <Link
                    href={`/admin/tickets/${ticket.ticket_no}`}
                    className="font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
                >
                    {ticket.ticket_no}
                </Link>
            ),
        },
        {
            header: 'Cabang Bank',
            cell: (ticket) => <span className="font-medium text-slate-800">{ticket.branch?.branch_name ?? '-'}</span>,
        },
        {
            header: 'Isu Masalah',
            className: 'min-w-[250px]',
            cell: (ticket) => <span className="text-slate-600 max-w-[250px] truncate block">{ticket.title}</span>,
        },
        {
            header: 'Waktu Dikirim',
            cell: (ticket) => (
                <span className="text-slate-500">

                    {formatLongDateTimeWIB(ticket.created_at)}
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
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${ticket.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200'
                        : ticket.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                    {ticket.priority ?? '-'}
                </span>
            ),
        },
        {
            header: 'Engineer',
            cell: (ticket) => {
                const engineers = ticket.problem_eng && ticket.problem_eng.length > 0
                    ? ticket.problem_eng.map((eng) => eng.engineer?.name).filter(Boolean).join(', ')
                    : '-';
                return <span className="text-slate-700 font-medium">{engineers}</span>;
            },
        },
    ];

    // 5. BAGIAN PANEL AKSI & INPUT KONTROL
    const adminActions = (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari tiket dari nomor atau judul..."
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
                    <option value="OPEN">Open</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            <div className="relative flex items-center bg-white border border-slate-200 rounded-lg shadow-sm px-4 py-3 hover:bg-slate-50 transition-colors">
                <ArrowUpDown size={20} className="text-slate-500 mr-3" />
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-transparent text-base font-semibold text-slate-700 focus:outline-none cursor-pointer pr-6"
                >
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                    <option value="priority-high">Prioritas</option>
                </select>
            </div>

            <Link
                href="/admin/create-ticket"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white border border-primary rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm whitespace-nowrap"
            >
                <PlusCircle size={18} />
                <span>Buat Tiket Baru</span>
            </Link>
        </div>
    );

    // 6. OPER DATA YANG SUDAH MATANG KE BASE TABLE
    return (
        <BaseTable
            title="Daftar Tiket"
            columns={columns}
            // Kirim data yang sudah di-slice (dipotong) untuk halaman saat ini
            data={paginatedTickets}
            actions={adminActions}
            emptyMessage={
                searchQuery || statusFilter !== 'ALL'
                    ? "Tidak ada tiket yang sesuai dengan filter pencarian Anda."
                    : "Tidak ada tiket yang ditemukan dalam sistem."
            }
            // Kirim konfigurasi pagination
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