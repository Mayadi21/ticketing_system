'use client';

import { 
  Search, 
  Bell, 
  HelpCircle, 
  LogOut,
  Filter,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Clock,
  PlayCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EngineerTicketListPage() {
  const router = useRouter();

  // Data tiruan untuk tiket yang ditugaskan kepada Engineer
  const assignedTickets = [
    { 
      id: 'TK-8492', 
      branch: 'KC Kampung Lalang', 
      issue: 'Tidak bisa membuat Mobile Banking', 
      priority: 'High',
      date: 'Oct 24, 10:30 AM', 
      status: 'Pending', 
      badgeBg: 'bg-slate-100 text-slate-700',
      icon: <Clock size={14} />
    },
    { 
      id: 'TK-8477', 
      branch: 'KC Gatot Subroto', 
      issue: 'Investigate memory leak in authentication service', 
      priority: 'High',
      date: 'Oct 24, 09:15 AM', 
      status: 'In Progress', 
      badgeBg: 'bg-blue-100 text-blue-700',
      icon: <PlayCircle size={14} />
    },
    { 
      id: 'TK-8501', 
      branch: 'KC USU', 
      issue: 'Update API documentation for v2 endpoints', 
      priority: 'Medium',
      date: 'Oct 23, 16:30 PM', 
      status: 'Pending', 
      badgeBg: 'bg-slate-100 text-slate-700',
      icon: <Clock size={14} />
    },
    { 
      id: 'TK-8450', 
      branch: 'Head Office (HO)', 
      issue: 'Implement rate limiting on public API', 
      priority: 'Low',
      date: 'Oct 23, 14:10 PM', 
      status: 'Done', 
      badgeBg: 'bg-green-100 text-green-700',
      icon: <CheckCircle2 size={14} />
    },
  ];

  // Helper untuk warna Priority
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-50 border border-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border border-amber-100';
      case 'Low': return 'text-green-600 bg-green-50 border border-green-100';
      default: return 'text-slate-600 bg-slate-50 border border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* TOP NAVIGATION BAR (Tanpa Sidebar) */}
      <header className="h-16 md:h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center">
          <div className="flex items-center gap-3 pr-4 md:pr-6 border-r border-slate-300">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">B</div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-slate-900 text-sm md:text-base leading-tight">Helpdesk Terminal</h1>
            </div>
          </div>
          <div className="pl-4 md:pl-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-600">Engineer Portal</h2>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">Engineer One</p>
              <p className="text-xs text-slate-500">IT Support</p>
            </div>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Engineer" alt="Profile" className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-slate-200 bg-slate-100 cursor-pointer" />
            <button onClick={() => router.push('/login')} className="text-slate-400 hover:text-red-500 transition-colors p-1 ml-1" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Action Tabel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Assigned Tickets</h1>
              <p className="text-sm text-slate-500 mt-1">Review and update the status of tickets assigned to you.</p>
            </div>
            
            <div className="flex gap-2">
              {/* Search Bar Khusus Tabel */}
              <div className="relative hidden md:block mr-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search Ticket ID..."
                  className="w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
              </div>

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
                    <th className="px-6 py-4">Branch Location</th>
                    <th className="px-6 py-4 min-w-[220px]">Issue Summary</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Assigned</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-slate-100">
                  {assignedTickets.map((ticket, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      
                      {/* Ticket ID */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary cursor-pointer hover:underline">
                          {ticket.id}
                        </span>
                      </td>
                      
                      {/* Branch Name */}
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {ticket.branch}
                      </td>
                      
                      {/* Issue Summary */}
                      <td className="px-6 py-4 text-slate-600 truncate max-w-[220px]">
                        {ticket.issue}
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${ticket.badgeBg}`}>
                          {ticket.icon}
                          {ticket.status}
                        </span>
                      </td>

                      {/* Date Submitted */}
                      <td className="px-6 py-4 text-slate-500">
                        {ticket.date}
                      </td>
                      
                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        <button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary hover:text-white transition-colors">
                          <Eye size={16} />
                          <span className="hidden xl:inline">Process Task</span>
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
                Showing <span className="text-slate-900 font-bold">1 to 4</span> of <span className="text-slate-900 font-bold">4</span> tasks
              </p>
              
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 border border-slate-200 rounded-md bg-white text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
                  <ChevronLeft size={18} />
                </button>
                <button className="px-3 py-1.5 border border-primary bg-primary text-white rounded-md text-sm font-bold shadow-sm">
                  1
                </button>
                <button className="p-1.5 border border-slate-200 rounded-md bg-white text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}