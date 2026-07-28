// src/components/ticket/BaseTable.tsx
'use client';

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ColumnDef<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => ReactNode;
    className?: string;
}

// Tambahkan interface untuk properti pagination
export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

interface BaseTableProps<T> {
    title: string;
    actions?: ReactNode;
    columns: ColumnDef<T>[];
    data: T[];
    emptyMessage?: string;
    pagination?: PaginationProps; // Opsional: jika tidak diisi, tampilkan semua
}

export default function BaseTable<T>({
    title,
    actions,
    columns,
    data,
    emptyMessage = 'No data found.',
    pagination,
}: BaseTableProps<T>) {
    
    // Fungsi pembantu untuk menampilkan teks "Showing X to Y of Z entries"
    const renderShowingText = () => {
        if (!pagination) {
            return <>Showing <span className="text-slate-900 font-bold">{data.length}</span> entries</>;
        }
        
        if (pagination.totalItems === 0) {
            return <>Showing <span className="text-slate-900 font-bold">0</span> entries</>;
        }

        const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
        const end = start + data.length - 1;

        return (
            <>
                Showing <span className="text-slate-900 font-bold">{start}</span> to <span className="text-slate-900 font-bold">{end}</span> of <span className="text-slate-900 font-bold">{pagination.totalItems}</span> entries
            </>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                <div className="flex flex-wrap gap-2">{actions}</div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                                {columns.map((col, idx) => (
                                    <th key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-500">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                                        {columns.map((col, colIndex) => (
                                            <td key={colIndex} className="px-6 py-4">
                                                {col.cell
                                                    ? col.cell(row)
                                                    : col.accessorKey
                                                    ? String(row[col.accessorKey] ?? '-')
                                                    : null}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER & PAGINATION */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <p className="text-sm text-slate-500 font-medium">
                        {renderShowingText()}
                    </p>

                    {/* Tampilkan kontrol pagination hanya jika props pagination tersedia dan data lebih dari 1 halaman */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="p-1.5 border border-slate-200 rounded-md bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            
                            <button className="px-3 py-1.5 border border-primary bg-primary text-white rounded-md text-sm font-bold shadow-sm">
                                {pagination.currentPage}
                            </button>
                            
                            <button
                                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="p-1.5 border border-slate-200 rounded-md bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}