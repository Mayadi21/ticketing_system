// src/components/ticket/TicketDetailAdmin.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Calendar, MapPin, FileText, Info, ShieldAlert, Save, UserPlus, CheckCircle2, Clock } from 'lucide-react';
import { Toast } from 'react-hot-toast';

// IMPORT SERVER ACTIONS (Tambahkan closeTicket)
import { setAndAssignTicket, addMoreEngineersToTicket, closeTicket } from '@/app/actions/ticket';
import { formatLongDateTimeWIB, formatForDatetimeInputWIB } from '@/utils/date';

import toast from 'react-hot-toast';
interface TicketDetailProps {
  ticketData: any;
  engineerOptions: Array<{ id: number | string; name: string }>;
}

export default function TicketDetail({ ticketData, engineerOptions }: TicketDetailProps) {
  const router = useRouter();

  const [status, setStatus] = useState(ticketData.status);
  const [selectedPriority, setSelectedPriority] = useState(ticketData.priority);

  const formatInitialDeadline = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().slice(0, 16);
  };

  const [deadline, setDeadline] = useState(formatInitialDeadline(ticketData.deadline));

  const originallyAssignedIds = ticketData.assignedEngineers?.map((e: any) => String(e.id)) || [];
  const [selectedEngineers, setSelectedEngineers] = useState<string[]>(originallyAssignedIds);
  const [loading, setLoading] = useState(false);

  const isOpen = status === 'OPEN';
  const isAssigned = status === 'ASSIGNED';
  const isEditable = isOpen || isAssigned;
  const isAllEngineersAssigned = originallyAssignedIds.length === engineerOptions.length;

  const handleEngineerCheckboxChange = (id: string) => {
    if (isAssigned && originallyAssignedIds.includes(id)) return;

    if (selectedEngineers.includes(id)) {
      setSelectedEngineers(selectedEngineers.filter(engId => engId !== id));
    } else {
      setSelectedEngineers([...selectedEngineers, id]);
    }
  };

  const handleSetAndAssign = async () => {
    if (!deadline) {
      toast.error('Harap tentukan deadline penugasan terlebih dahulu!');
      return;
    }

    setLoading(true);
    try {
      const result = await setAndAssignTicket(
        ticketData.id,
        selectedPriority,
        deadline,
        selectedEngineers
      );

      if (result.error) throw new Error(result.error);

      toast.success('Tiket berhasil diatur, dialihkan ke status ASSIGNED, dan notifikasi telah dikirim!');
      setStatus('ASSIGNED');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses Set and Assign.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleAddMoreEngineers = async () => {
    const newEngineers = selectedEngineers.filter(id => !originallyAssignedIds.includes(id));


    setLoading(true);
    try {
      const result = await addMoreEngineersToTicket(ticketData.id, newEngineers);

      if (result.error) throw new Error(result.error);

      toast.success('Engineer tambahan berhasil ditugaskan dan notifikasi telah dikirim!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambahkan engineer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- TAMBAHAN AKSI 3: Tutup Tiket ---
  const handleCloseTicket = async () => {
    const konfirmasi = confirm('Apakah Anda yakin ingin menutup tiket ini secara permanen?');
    if (!konfirmasi) return;

    setLoading(true);
    try {
      const result = await closeTicket(ticketData.id);

      if (result.error) throw new Error(result.error);

      toast.success('Tiket berhasil diselesaikan dan diubah menjadi status CLOSED!');
      setStatus('CLOSED');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menutup tiket.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-900 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
              <ArrowLeft size={18} /> Kembali
            </button>
            <div className="h-6 w-[1px] bg-slate-300"></div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Tiket {ticketData.ticketNumber}</h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${status === 'OPEN'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : status === 'RESOLVED'
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : status === 'CLOSED'
                    ? 'bg-gray-100 text-gray-700 border-gray-300'
                    : 'bg-blue-100 text-blue-700 border-blue-200'
                }`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* COL 1: META INFO */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">

              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                      Tiket
                    </p>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1">
                      #{ticketData.ticketNumber}
                    </h1>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${status === 'OPEN'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : status === 'RESOLVED'
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : status === 'CLOSED'
                          ? 'bg-gray-100 text-gray-700 border-gray-300'
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* META INFO INLINE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-2 font-medium">
                      <User size={14} />
                      Dilaporkan Oleh
                    </div>
                    <p className="text-slate-900 font-medium">
                      {ticketData.reportedBy}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-2 font-medium">
                      <MapPin size={14} />
                      Cabang Bank
                    </div>
                    <p className="text-slate-900 font-medium">
                      {ticketData.branchLocation}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-2 font-medium">
                      <Calendar size={14} />
                      Tanggal Dibuat
                    </div>
                    <p className="text-slate-900 font-medium">
                      {formatLongDateTimeWIB(ticketData.createdAt)} {/* <-- Hilangkan new Date() */}
                    </p>
                  </div>
                </div>

                {/* TITLE */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {ticketData.title}
                  </h2>
                </div>

                {/* DESCRIPTION */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-slate-700 leading-8 whitespace-pre-wrap">
                    {ticketData.description}
                  </p>
                </div>

                {/* ATTACHMENTS */}
{ticketData.attachments?.length > 0 && (
  <div className="mt-8">
    <h3 className="text-sm font-semibold text-slate-900 mb-4">
      Lampiran Masalah
    </h3>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {ticketData.attachments.map((att: any) => {
        // Deteksi apakah ekstensi file adalah PDF
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
                // Tampilan Khusus PDF
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors z-10">
                  <FileText size={48} strokeWidth={1.5} />
                  <span className="text-xs font-semibold">Lihat PDF</span>
                </div>
              ) : (
                // Tampilan Gambar
                <img
                  src={att.url}
                  alt="Attachment"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              
              {/* Efek overlay transparan agar transisi hover lebih halus */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-20 pointer-events-none"></div>
            </div>
          </a>
        );
      })}
    </div>
  </div>
)}

                {/* --- SOLUTION DETAILS --- */}
                {(status === 'RESOLVED' || status === 'CLOSED') && (
                  <div className="mt-10 border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
                      <CheckCircle2 size={24} />
                      Detail Solusi
                    </h2>

                    {/* Solution Note */}
                    {ticketData.solution_note && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8">
                        <p className="text-slate-800 leading-8 whitespace-pre-wrap">
                          {ticketData.solution_note}
                        </p>
                      </div>
                    )}

                    {/* Solution Attachments */}
{ticketData.solution_attachments?.length > 0 && (
  <div>
    <h3 className="text-sm font-semibold text-slate-900 mb-4">
      Lampiran Solusi
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {ticketData.solution_attachments.map((att: any) => {
        // Deteksi apakah file berekstensi PDF menggunakan file_path
        const isPdf = att.file_path?.toLowerCase().includes('.pdf');

        return (
          <a
            key={att.id}
            href={att.file_path}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm relative h-44 bg-slate-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              {isPdf ? (
                // Tampilan Khusus PDF
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-emerald-500 transition-colors z-10">
                  <FileText size={48} strokeWidth={1.5} />
                  <span className="text-xs font-semibold">Lihat PDF</span>
                </div>
              ) : (
                // Tampilan Gambar
                <img
                  src={att.file_path}
                  alt="Solution Attachment"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              
              {/* Efek overlay transparan */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-20 pointer-events-none"></div>
            </div>
          </a>
        );
      })}
    </div>
  </div>
)}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* COL 3: TICKET CONTROL & ENGINEERS */}
          <div className="lg:col-span-4 space-y-6">

            {/* KARTU 1: CONTROL STATUS, PRIORITY & DEADLINE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-sm text-slate-700">Kelola Tiket</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Prioritas:</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${ticketData.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
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
    {ticketData.deadline ? formatLongDateTimeWIB(ticketData.deadline) : 'belum ditentukan'} {/* <-- Hilangkan new Date() */}
  </span>
                  </div>
                </div>

                {/* PERUBAHAN DI SINI: Render Kondisional Berdasarkan Status */}
                {isEditable ? (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Edit Prioritas</label>
                      <select
                        disabled={loading || isAssigned}
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className={`w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow ${isAssigned ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''
                          }`}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Deadline Penugasan</label>
                      <input
                        type="datetime-local"
                        disabled={loading || isAssigned}
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className={`w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow ${isAssigned ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''
                          }`}
                      />
                    </div>
                  </div>
                ) : status === 'RESOLVED' ? (
                  // TAMPILKAN TOMBOL INI JIKA STATUS == RESOLVED
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                      <Info size={14} className="flex-shrink-0" />
                      Solusi telah diberikan. Anda dapat menutup tiket ini jika sudah selesai.
                    </div>
                    <button
                      disabled={loading}
                      onClick={handleCloseTicket}
                      className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 size={14} />
                      {loading ? 'Menutup...' : 'Tutup Tiket'}
                    </button>
                  </div>
                ) : (
                  // JIKA STATUS == CLOSED
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 italic">
                    <ShieldAlert size={14} className="text-slate-400" /> Tiket telah ditutup. Tidak ada tindakan lebih lanjut yang dapat diambil.
                  </div>
                )}
              </div>
            </div>

            {/* KARTU 2: ASSIGNED ENGINEERS */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-slate-700">
                <UserPlus size={16} className="text-slate-500" />
                <h3 className="font-semibold text-sm">Engineer Ditugaskan</h3>
              </div>

              <div className="p-4">
                {isEditable ? (
                  <div className="space-y-4">
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                      {engineerOptions.map((eng) => {
                        const isOriginallyAssigned = originallyAssignedIds.includes(String(eng.id));
                        const isChecked = selectedEngineers.includes(String(eng.id));
                        const isDisabledCheckbox = loading || (isAssigned && isOriginallyAssigned);

                        return (
                          <label
                            key={eng.id}
                            className={`flex items-center gap-3 p-2.5 rounded-lg text-xs transition-colors border ${isOriginallyAssigned && isAssigned
                              ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                              : isChecked
                                ? 'bg-blue-50 border-blue-200 text-blue-800 font-medium cursor-pointer'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                              }`}
                          >
                            <input
                              type="checkbox"
                              disabled={isDisabledCheckbox}
                              checked={isChecked}
                              onChange={() => handleEngineerCheckboxChange(String(eng.id))}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 disabled:opacity-50"
                            />
                            <span className="flex-1">{eng.name}</span>
                            {isOriginallyAssigned && isAssigned && (
                              <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded font-medium">Ditugaskan</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      {isOpen && (
                        <button
                          disabled={loading}
                          onClick={handleSetAndAssign}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 size={14} />
                          {loading ? 'Memproses...' : 'Set & Tugaskan'}
                        </button>
                      )}

                      {!isOpen && !isAllEngineersAssigned && (
                        <button
                          disabled={loading}
                          onClick={handleAddMoreEngineers}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          <Save size={14} />
                          {loading ? 'Memproses...' : 'Tugaskan Engineer'}
                        </button>
                      )}

                      {!isOpen && isAllEngineersAssigned && (
                        <div className="text-center py-2">
                          <span className="text-[11px] text-slate-500 italic bg-slate-100 px-3 py-1.5 rounded-md">
                            All engineers have been assigned.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ticketData.assignedEngineers?.length > 0 ? (
                      ticketData.assignedEngineers.map((eng: any) => (
                        <div key={eng.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs text-slate-700 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          {eng.name}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Tidak ada engineer ditugaskan.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}