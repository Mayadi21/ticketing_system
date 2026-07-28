'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, User, Calendar, MapPin,
  UserPlus, Clock, Play, CheckCircle, FileText
} from 'lucide-react';

import { startSolveTicket } from '@/app/actions/ticket';
import { toast } from 'react-hot-toast';
import { formatLongDateTimeWIB } from '@/utils/date';

interface TicketDetailProps {
  ticketData: {
    id: string;
    ticketNumber: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    deadline: string | null;
    reportedBy: string;
    branchLocation: string;
    createdAt: string;
    attachments: Array<{ id: string; url: string }>;
    assignedEngineers: Array<{ id: string; name: string }>;
    // Penambahan properti solusi
    solutionNote?: string | null;
    solutionAttachments?: Array<{ id: string; url: string }>;
  };
}

export default function TicketDetail({ ticketData }: TicketDetailProps) {
  const router = useRouter();

  const [currentStatus, setCurrentStatus] = useState(ticketData.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartSolve = async () => {
    setIsUpdating(true);

    try {
      const result = await startSolveTicket(ticketData.id);

      if (result.error) {
        alert(result.error);
      } else {
        setCurrentStatus('IN_PROGRESS');
        router.refresh();
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan saat memulai pengerjaan tiket.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-900 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={18} /> Kembali
            </button>
            <div className="h-6 w-[1px] bg-slate-300"></div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                Ticket {ticketData.ticketNumber}
              </h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                  currentStatus === 'OPEN' || currentStatus === 'ASSIGNED'
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : currentStatus === 'IN_PROGRESS'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}>
                {currentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* COL 1: META INFO & CONTENT */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Ticket</p>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1">#{ticketData.ticketNumber}</h1>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* META INFO INLINE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-2 font-medium">
                      <User size={14} /> Dilaporkan Oleh
                    </div>
                    <p className="text-slate-900 font-medium">{ticketData.reportedBy}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-2 font-medium">
                      <MapPin size={14} /> Lokasi Masalah
                    </div>
                    <p className="text-slate-900 font-medium">{ticketData.branchLocation}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-2 font-medium">
                      <Calendar size={14} /> Tanggal Pembuatan
                    </div>
                    <p className="text-slate-900 font-medium">
                      {formatLongDateTimeWIB(ticketData.createdAt)}
                    </p>
                  </div>
                </div>

                {/* TITLE & DESCRIPTION */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{ticketData.title}</h2>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <p className="text-slate-700 leading-8 whitespace-pre-wrap">{ticketData.description}</p>
                  </div>
                </div>

                {/* PROBLEM ATTACHMENTS */}
                {ticketData.attachments && ticketData.attachments.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Lampiran Masalah</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {ticketData.attachments.map((att) => {
                        const isPdf = att.url.toLowerCase().includes('.pdf');
                        return (
                          <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="group block">
                            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm h-44 bg-slate-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                              {isPdf ? (
                                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                                  <FileText size={48} strokeWidth={1.5} />
                                  <span className="text-xs font-semibold">Lihat PDF</span>
                                </div>
                              ) : (
                                <img src={att.url} alt="Attachment" className="h-full w-full object-cover" />
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* --- BAGIAN SOLUSI --- */}
                {(ticketData.solutionNote || (ticketData.solutionAttachments && ticketData.solutionAttachments.length > 0)) && (
                  <div className="mt-12 pt-8 border-t border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <CheckCircle className="text-emerald-500" size={24} />
                      Penyelesaian & Solusi
                    </h2>

                    {ticketData.solutionNote && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8 shadow-sm">
                        <p className="text-slate-800 leading-8 whitespace-pre-wrap">{ticketData.solutionNote}</p>
                      </div>
                    )}

                    {ticketData.solutionAttachments && ticketData.solutionAttachments.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">Lampiran Solusi</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {ticketData.solutionAttachments.map((att) => {
                            const isPdf = att.url.toLowerCase().includes('.pdf');
                            return (
                              <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="group block">
                                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm h-44 bg-slate-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                                  {isPdf ? (
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-emerald-500 transition-colors">
                                      <FileText size={48} strokeWidth={1.5} />
                                      <span className="text-xs font-semibold">Lihat PDF</span>
                                    </div>
                                  ) : (
                                    <img src={att.url} alt="Lampiran Solusi" className="h-full w-full object-cover" />
                                  )}
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* --- AKHIR BAGIAN SOLUSI --- */}

              </div>
            </div>
          </div>

          {/* COL 2: TICKET CONTROL & ENGINEERS */}
          <div className="lg:col-span-4 space-y-6">

            {/* ACTION BUTTONS */}
            {(currentStatus === 'ASSIGNED' || currentStatus === 'IN_PROGRESS') && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-sm text-slate-700">Ticket Actions</h3>
                </div>
                <div className="p-4">
                  {currentStatus === 'ASSIGNED' && (
                    <button
                      onClick={handleStartSolve}
                      disabled={isUpdating}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <Play size={18} />
                      {isUpdating ? 'Memproses...' : 'Start Solve'}
                    </button>
                  )}

                  {currentStatus === 'IN_PROGRESS' && (
                    <button
                      onClick={() => router.push(`/engineer/tickets/${ticketData.id}/solution`)}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                    >
                      <CheckCircle size={18} />
                      Finish Problem
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* KARTU 1: INFO STATUS, PRIORITY & DEADLINE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-sm text-slate-700">Info Tiket</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Prioritas:</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${
                        ticketData.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                        ticketData.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                      {ticketData.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Deadline:</span>
                    <span className="text-xs font-medium text-slate-900 flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-500" />
                      {ticketData.deadline ? formatLongDateTimeWIB(ticketData.deadline) : 'belum ditentukan'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KARTU 2: ASSIGNED ENGINEERS ONLY */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-slate-700">
                <UserPlus size={16} className="text-slate-500" />
                <h3 className="font-semibold text-sm">Engineer yang Ditugaskan</h3>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {ticketData.assignedEngineers && ticketData.assignedEngineers.length > 0 ? (
                    ticketData.assignedEngineers.map((eng) => (
                      <div
                        key={eng.id}
                        className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs text-slate-700 font-medium"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        {eng.name}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">Tidak ada engineer yang ditugaskan.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}