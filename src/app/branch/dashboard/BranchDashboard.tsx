'use client';

import {
  ClipboardList,
  RefreshCw,
  CheckCircle2,
  PlusCircle,
  HelpCircle,
  Phone,
  Clock,
  ArrowRight,
} from "lucide-react";

import { useRouter } from "next/navigation";
import Link from 'next/link';
import { formatLongDateTimeWIB } from '@/utils/date';


// 1. Definisikan tipe data untuk props
interface Ticket {
  id: string | number;
  ticket_no: string;
  title: string;
  status: string;
  created_at: string;
}

interface BranchDashboardProps {
  userName: string;
  branchName: string;
  needApproval: number;
  inProgress: number;
  resolvedThisMonth: number;
  recentTickets: Ticket[];
}

export default function BranchDashboard({
  userName,
  branchName,
  needApproval,
  inProgress,
  resolvedThisMonth,
  recentTickets,
}: BranchDashboardProps) {
  const router = useRouter();

  // Helper untuk mendapatkan gaya badge sesuai status tiket
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ASSIGNED":
      case "IN_PROGRESS":
        return (
          <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
            {status.replace("_", " ")}
          </span>
        );
      case "RESOLVED":
        return (
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
            {status}
          </span>
        );
      case "CLOSED":
        return (
          <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  // Helper untuk format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* GREETING */}
      <section>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 capitalize">
            Selamat Datang, {userName || "User"}!
          </h1>

          <p className="text-sm text-slate-400 mt-1 capitalize">
            {branchName || " "}
          </p>
        </div>
      </section>

      {/* KPI CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Need Approval */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Belum Dikelola</p>
              <h3 className="text-4xl font-bold text-slate-900 mt-3">{needApproval}</h3>
            </div>
            <div className="bg-[#f1f5f9] text-gray-600 p-4 rounded-xl">
              <ClipboardList size={24} />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sedang Diproses</p>
              <h3 className="text-4xl font-bold text-slate-900 mt-3">{inProgress}</h3>
            </div>
            <div className="bg-[#eff6ff] text-blue-500 p-4 rounded-xl">
              <RefreshCw size={24} />
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tiket Selesai Bulan Ini</p>
              <h3 className="text-4xl font-bold text-slate-900 mt-3">{resolvedThisMonth}</h3>
            </div>
            <div className="bg-[#f0fdf4] text-green-600 p-4 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* TABLE */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
<div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
  <h3 className="text-lg font-semibold text-slate-900">
    Tiket Terbaru
  </h3>

  <Link
    href="/branch/tickets"
    className="text-primary text-sm font-medium flex items-center gap-1 hover:underline transition-colors"
  >
    Lihat Semua
    <ArrowRight size={16} />
  </Link>
</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-slate-500">
                  <th className="px-6 py-4">Tiket</th>
                  <th className="px-6 py-4">Masalah</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Tanggal Dibuat</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.length > 0 ? (
                  recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{ticket.ticket_no}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{ticket.title}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatLongDateTimeWIB(ticket.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada tiket terbaru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6">
          {/* CREATE TICKET */}
          <Link
            href="/branch/create-ticket"
            className="block relative overflow-hidden bg-gradient-to-br from-primary to-accent transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer text-white rounded-2xl p-6 group outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10">
              <PlusCircle
                size={42}
                strokeWidth={1.5}
                className="mb-4 transition-all duration-500 ease-out group-hover:scale-125 group-hover:rotate-90 drop-shadow-md"
              />

              <h3 className="text-xl font-bold mb-2">Buat Tiket Baru</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Kirim masalah atau permintaan dukungan baru ke tim IT regional.
              </p>

              <div className="flex items-center justify-center w-full bg-white/10 group-hover:bg-white group-hover:text-primary transition-all duration-300 px-4 py-2.5 rounded-xl text-sm font-bold border border-white/20 group-hover:border-white shadow-sm">
                Buat Tiket
              </div>
            </div>
          </Link>

          {/* SUPPORT */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle size={20} className="text-accent" />
              <h3 className="font-semibold text-slate-900">Dukungan IT Regional</h3>
            </div>
            <div className="space-y-5">
              <div className="flex gap-3">
                <Phone size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">Nomor Hotline Darurat</p>
                  <p className="text-sm text-slate-500">1-800-123-456</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">Jam Dukungan</p>
                  <p className="text-sm text-slate-500">Senin - Jumat | 09:00 - 17:00 WIB</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-400 italic">
                Untuk gangguan kritis di luar jam operasional, segera ikuti protokol eskalasi darurat.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}