// src/components/ticket/branch/BranchTicketTable.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Filter, ArrowUpDown, Search } from 'lucide-react';
import BaseTable, { ColumnDef } from '../BaseTable';
import { formatLongDateTimeWIB } from '@/utils/date';

export interface Ticket {
    id: number;
    ticket_no: string;
    title: string;
    status: string;
    priority?: string; // Ditambahkan
    created_at: string;
}

interface BranchTicketTableProps {
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

export default function BranchTicketTable({ tickets }: BranchTicketTableProps) {
    // 1. STATE UNTUK KONTROL (SEARCH, FILTER, SORT)
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOption, setSortOption] = useState('newest');

    // 2. STATE UNTUK PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Sesuaikan jika ingin menampilkan lebih banyak baris

    // Reset pagination ke halaman 1 setiap kali input pencarian/filter berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, sortOption]);

    // 3. LOGIKA FILTER & SORTING DATA
    const processedTickets = useMemo(() => {
        let result = [...tickets];

        // Search
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (ticket) =>
                    ticket.ticket_no.toLowerCase().includes(query) ||
                    ticket.title.toLowerCase().includes(query)
            );
        }

        // Filter Status
        if (statusFilter !== 'ALL') {
            result = result.filter((ticket) => ticket.status === statusFilter);
        }

        // Sort (Hanya Newest & Oldest)
        result.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            
            return sortOption === 'newest' ? timeB - timeA : timeA - timeB;
        });

        return result;
    }, [tickets, searchQuery, statusFilter, sortOption]);

    // 4. LOGIKA PEMOTONGAN DATA UNTUK PAGINATION
    const totalItems = processedTickets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const paginatedTickets = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return processedTickets.slice(startIndex, endIndex);
    }, [processedTickets, currentPage, itemsPerPage]);

    // 5. DEFINISI KOLOM
    const columns: ColumnDef<Ticket>[] = [
        {
            header: 'ID Tiket',
            cell: (ticket) => (
                <Link
                    href={`/branch/tickets/${ticket.ticket_no}`}
                    className="font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
                >
                    {ticket.ticket_no}
                </Link>
            ),
        },
        {
            header: 'Masalah',
            className: 'min-w-[250px]',
            cell: (ticket) => <span className="text-slate-600 max-w-[250px] truncate block">{ticket.title}</span>,
        },
        {
            header: 'Tanggal Dibuat',
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

    // 6. KONTROL AKSI (SEARCH & DROPDOWN)
    const branchActions = (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari ID dan Judul Tiket..."
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
                    <option value="ALL">Semua Status</option>
                    <option value="OPEN">Open</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            <div className="relative flex items-center bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2 hover:bg-slate-50 transition-colors">
                <ArrowUpDown size={16} className="text-slate-500 mr-2" />
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer pr-4"
                >
                    <option value="newest">Tiket terbaru</option>
                    <option value="oldest">Tiket terlama</option>
                </select>
            </div>
        </div>
    );

    // 7. OPER DATA YANG SUDAH DIPOTONG KE BASE TABLE
    return (
        <BaseTable 
            title="Daftar Tiket Cabang"
            columns={columns}
            data={paginatedTickets} // Menggunakan data yang sudah terpotong (10 per halaman)
            actions={branchActions}
            emptyMessage={
                searchQuery || statusFilter !== 'ALL'
                    ? "Tidak ada tiket yang sesuai dengan kriteria pencarian/filter."
                    : "Tidak ada tiket yang diajukan oleh cabang Anda."
            }
            // Mengirim properti pagination ke BaseTable
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