'use client';

import { Filter, ArrowUpDown, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TicketQueuePage() {
  const router = useRouter();

  // Data tiruan berdasarkan desain Figma Anda
  const tickets = [
    { id: 'INC-8493', issue: 'Tidak bisa membuat mobile banking', date: 'Oct 24, 10:30 AM', status: 'Needs Approval', statusColor: 'bg-indigo-100 text-indigo-700', dotColor: 'bg-indigo-600' },
    { id: 'INC-8492', issue: 'ATM #4 Cash Dispenser Jar', date: 'Oct 24, 09:15 AM', status: 'In Progress', statusColor: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
    { id: 'INC-8491', issue: 'Network Outage in Teller Ro', date: 'Oct 24, 08:45 AM', status: 'Pending', statusColor: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-500' },
    { id: 'INC-8490', issue: 'Printer Connection Failure', date: 'Oct 23, 16:30 PM', status: 'Done', statusColor: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
    { id: 'INC-8489', issue: 'Vault Door Sensor Malfuncti', date: 'Oct 23, 14:10 PM', status: 'In Progress', statusColor: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[28px] font-bold text-gray-900">Ticket Queue</h1>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowUpDown size={16} />
            Sort
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col">
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            {/* TABLE HEAD */}
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-3.5 whitespace-nowrap">Ticket ID</th>
                <th className="px-6 py-3.5 min-w-[250px]">Issue</th>
                <th className="px-6 py-3.5 whitespace-nowrap">Date Submitted</th>
                <th className="px-6 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-6 py-3.5 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            
            {/* TABLE BODY */}
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-primary font-medium whitespace-nowrap">
                    {ticket.id}
                  </td>
                  <td className="px-6 py-4 text-gray-900 truncate max-w-[250px]">
                    {ticket.issue}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {ticket.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Status Badge with Dot */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${ticket.statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ticket.dotColor}`}></span>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-medium transition-colors">
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION (FOOTER) */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
          <p className="text-sm text-gray-600">
            Showing 1 to 5 of 25 entries
          </p>
          
          <div className="flex items-center gap-1">
            <button className="p-1.5 border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1.5 border border-primary bg-primary text-white rounded text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded text-sm font-medium">
              2
            </button>
            <button className="px-3 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded text-sm font-medium">
              3
            </button>
            <button className="p-1.5 border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}