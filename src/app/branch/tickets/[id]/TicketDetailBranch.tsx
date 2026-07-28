'use client';

import { ArrowLeft, Calendar, AlertCircle, CheckCircle2, Paperclip, FileText } from 'lucide-react';
import { formatLongDateTimeWIB } from '@/utils/date';
interface TicketDetailBranchProps {
    ticketData: {

        status: string;
        priority: string; id: string;
        ticketNumber: string;
        title: string;
        description: string;
        solutionNote: string | null;
        createdAt: string;
        problemAttachments: Array<{ id: string; url: string }>;
        solutionAttachments: Array<{ id: string; url: string }>;
    };
}

export default function TicketDetailBranch({ ticketData }: TicketDetailBranchProps) {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-900 font-sans">
            <div className="max-w-[1000px] mx-auto space-y-6">

                {/* HEADER & NAVIGASI BACK */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
                        >
                            <ArrowLeft size={18} /> Kembali
                        </button>
                        <div className="h-6 w-[1px] bg-slate-300 hidden md:block"></div>
                        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                            Ticket #{ticketData.ticketNumber}
                        </h1>
                    </div>

                    {/* STATUS BADGE */}
                    <div>
                        <span className={`px-4 py-1.5 text-sm font-bold rounded-full border shadow-sm ${ticketData.status === 'OPEN' || ticketData.status === 'ASSIGNED'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : ticketData.status === 'IN_PROGRESS'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                            {ticketData.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* KOTAK INFORMASI UTAMA (META DATA) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Tanggal Pembuatan</p>
                            <p className="text-sm font-bold text-slate-900">
                                {formatLongDateTimeWIB(ticketData.createdAt)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${ticketData.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                                ticketData.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-600' :
                                    'bg-slate-100 text-slate-600'
                            }`}>
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Tingkat Prioritas</p>
                            <p className={`text-sm font-bold ${ticketData.priority === 'HIGH' ? 'text-red-700' :
                                    ticketData.priority === 'MEDIUM' ? 'text-orange-700' :
                                        'text-slate-700'
                                }`}>
                                {ticketData.priority}
                            </p>
                        </div>
                    </div>
                </div>

                {/* BAGIAN 1: DETAIL MASALAH YANG DILAPORKAN */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <AlertCircle size={18} className="text-slate-600" />
                        <h2 className="font-bold text-slate-800">Detail Kendala / Laporan</h2>
                    </div>

                    <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">{ticketData.title}</h3>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-6">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{ticketData.description}</p>
                        </div>

                        {/* LAMPIRAN MASALAH */}
                        {ticketData.problemAttachments.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Paperclip size={16} /> Lampiran Laporan
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

                                    {ticketData.problemAttachments.map((att) => {
                                        // Periksa apakah URL berekstensi PDF
                                        const isPdf = att.url.toLowerCase().includes('.pdf');

                                        return (
                                            <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="group block">
                                                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm relative h-32 bg-slate-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                                                    {isPdf ? (
                                                        // Tampilan untuk PDF
                                                        <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 group-hover:text-primary transition-colors z-10">
                                                            <FileText size={36} strokeWidth={1.5} />
                                                            <span className="text-[11px] font-semibold">Lihat PDF</span>
                                                        </div>
                                                    ) : (
                                                        // Tampilan untuk Gambar
                                                        <img
                                                            src={att.url}
                                                            alt="Lampiran Masalah"
                                                            className="absolute inset-0 h-full w-full object-cover"
                                                        />
                                                    )}

                                                    {/* Efek overlay gelap saat di-hover */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-20 pointer-events-none"></div>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Solution Attachments */}
                {ticketData.solutionAttachments?.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">
                            Lampiran Solusi
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {ticketData.solutionAttachments.map((att: any) => {
                                // Periksa apakah URL berekstensi PDF
                                const isPdf = att.url?.toLowerCase().includes('.pdf');

                                return (
                                    <a
                                        key={att.id}
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block"
                                    >
                                        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm relative h-44 bg-slate-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                                            {isPdf ? (
                                                // Tampilan untuk PDF
                                                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-emerald-500 transition-colors z-10">
                                                    <FileText size={48} strokeWidth={1.5} />
                                                    <span className="text-xs font-semibold">Lihat PDF</span>
                                                </div>
                                            ) : (
                                                // Tampilan untuk Gambar
                                                <img
                                                    src={att.url}
                                                    alt="Lampiran Solusi"
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                />
                                            )}

                                            {/* Efek overlay gelap saat di-hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-20 pointer-events-none"></div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}