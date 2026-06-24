'use client';

import { 
  Filter, 
  ArrowUpDown, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  PlusCircle // Tambahkan ikon PlusCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminTicketQueuePage() {
  // Data sesuai dengan gambar referensi
  const tickets = [
    { 
      id: 'INC-8493', 
      branch: 'KC Kampung Lalang', 
      issue: 'Tidak bisa membuat mobi...', 
      date: 'Oct 24, 10:30 AM', 
      engineer: 'Unassigned', 
      status: 'Needs Approval', 
      badgeBg: 'bg-blue-100 text-blue-700', 
      dotBg: 'bg-blue-600' 
    },
    { 
      id: 'INC-8492', 
      branch: 'Downtown Metro', 
      issue: 'ATM #4 Cash Dispenser Jar', 
      date: 'Oct 24, 09:15 AM', 
      engineer: 'Sarah Jenkins', 
      status: 'In Progress', 
      badgeBg: 'bg-amber-100 text-amber-700', 
      dotBg: 'bg-amber-500' 
    },
    { 
      id: 'INC-8491', 
      branch: 'Westside Plaza', 
      issue: 'Network Outage in Teller Ro', 
      date: 'Oct 24, 08:45 AM', 
      engineer: 'Unassigned', 
      status: 'Pending', 
      badgeBg: 'bg-slate-100 text-slate-700', 
      dotBg: 'bg-slate-500' 
    },
    { 
      id: 'INC-8490', 
      branch: 'North Hills Branch', 
      issue: 'Printer Connection Failure', 
      date: 'Oct 23, 16:30 PM', 
      engineer: 'Michael Chen', 
      status: 'Done', 
      badgeBg: 'bg-green-100 text-green-700', 
      dotBg: 'bg-green-500' 
    },
    { 
      id: 'INC-8489', 
      branch: 'South End Corporate', 
      issue: 'Vault Door Sensor Malfuncti', 
      date: 'Oct 23, 14:10 PM', 
      engineer: 'David Torres', 
      status: 'In Progress', 
      badgeBg: 'bg-amber-100 text-amber-700', 
      dotBg: 'bg-amber-500' 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-slate-900">Ticket Queue</h1>
        
        {/* Tombol Aksi Kanan */}
        <div className="flex flex-wrap gap-2">
          {/* TOMBOL CREATE NEW TICKET */}
          <Link 
            href="/admin/create-ticket" 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white border border-primary rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm"
          >
            <PlusCircle size={18} />
            <span className="hidden sm:inline">Create New Ticket</span>
            <span className="sm:hidden">New Ticket</span>
          </Link>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={16} className="text-slate-500" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowUpDown size={16} className="text-slate-500" />
            <span className="hidden sm:inline">Sort</span>
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Branch Name</th>
                <th className="px-6 py-4 min-w-[220px]">Issue Summary</th>
                <th className="px-6 py-4">Date Submitted</th>
                <th className="px-6 py-4">Assigned Engineer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-primary cursor-pointer hover:underline">
                      {ticket.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {ticket.branch}
                  </td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-[220px]">
                    {ticket.issue}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {ticket.date}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {ticket.engineer}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${ticket.badgeBg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ticket.dotBg}`}></span>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="inline-flex items-center justify-center gap-1.5 text-primary font-bold hover:text-primary-dark transition-colors">
                      <Eye size={18} />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-900 font-bold">1 to 5</span> of <span className="text-slate-900 font-bold">25</span> entries
          </p>
          
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 border border-slate-200 rounded-md bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors disabled:opacity-50">
              <ChevronLeft size={18} />
            </button>
            <button className="px-3 py-1.5 border border-primary bg-primary text-white rounded-md text-sm font-bold shadow-sm">
              1
            </button>
            <button className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-md text-sm font-bold transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-md text-sm font-bold transition-colors">
              3
            </button>
            <button className="p-1.5 border border-slate-200 rounded-md bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}