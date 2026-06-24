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

export default function BranchDashboard() {
  const router = useRouter();
  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* GREETING */}
      <section>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Good Morning, Andi 👋
          </h1>
          <p className="text-slate-500 mt-2">
            Here's the latest status of your branch support activities.
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Bank Sumut KC Kampung Lalang
          </p>
        </div>
      </section>

      {/* KPI CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Need Approval */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Need Approval</p>
              <h3 className="text-4xl font-bold text-slate-900 mt-3">1</h3>
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
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress</p>
              <h3 className="text-4xl font-bold text-slate-900 mt-3">1</h3>
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
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resolved This Month</p>
              <h3 className="text-4xl font-bold text-slate-900 mt-3">12</h3>
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
            <h3 className="text-lg font-semibold text-slate-900">Recent Tickets</h3>
            <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-slate-500">
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">TKT-8902</td>
                  <td className="px-6 py-4 font-medium text-slate-900">ATM Cash Dispenser Jam</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">Need Approval</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">10 mins ago</td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">TKT-8895</td>
                  <td className="px-6 py-4 font-medium text-slate-900">Network Connectivity Loss</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">In Progress</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">2 hrs ago</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">TKT-8850</td>
                  <td className="px-6 py-4 font-medium text-slate-900">Printer Toner Replacement</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">Resolved</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">Yesterday</td>
                </tr>
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
            {/* Ornamen Dekoratif Blur di latar belakang kartu */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

            {/* Konten Utama */}
            <div className="relative z-10">
              <PlusCircle
                size={42}
                strokeWidth={1.5}
                className="mb-4 transition-all duration-500 ease-out group-hover:scale-125 group-hover:rotate-90 drop-shadow-md"
              />

              <h3 className="text-xl font-bold mb-2">Create New Ticket</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Submit a new issue or support request to the regional IT team.
              </p>

              {/* Menggunakan div alih-alih button agar tidak terjadi error HTML bersarang */}
              <div
                className="flex items-center justify-center w-full bg-white/10 group-hover:bg-white group-hover:text-primary transition-all duration-300 px-4 py-2.5 rounded-xl text-sm font-bold border border-white/20 group-hover:border-white shadow-sm"
              >
                Open Form
              </div>
            </div>
          </Link>

          {/* SUPPORT */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle size={20} className="text-accent" />
              <h3 className="font-semibold text-slate-900">Regional IT Support</h3>
            </div>
            <div className="space-y-5">
              <div className="flex gap-3">
                <Phone size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">Emergency Hotline</p>
                  <p className="text-sm text-slate-500">1-800-123-456</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">Support Hours</p>
                  <p className="text-sm text-slate-500">Mon - Fri | 09:00 - 17:00 WIB</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-400 italic">
                For critical outages outside operating hours, immediately follow the emergency escalation protocol.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}