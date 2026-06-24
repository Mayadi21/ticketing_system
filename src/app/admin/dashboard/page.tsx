'use client';

import {
  Ticket,
  Hourglass,
  UserCog,
  CheckCircle2,
  TrendingUp,
  ArrowRight
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* GREETING (Gaya visual Branch, Teks Admin) */}
      <section>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Admin John Doe
          </h1>
          <p className="text-slate-500 mt-2">
            System overview and real-time metrics.
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Bank Sumut Pusat (HO Helpdesk)
          </p>
        </div>
      </section>

      {/* KPI CARDS (Fitur Admin, Gaya Visual Branch) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Tickets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Tickets</p>
              <h3 className="text-4xl font-bold text-slate-900 mt-3">1,248</h3>
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <TrendingUp size={14} className="text-blue-600" />
                <span className="text-blue-600 font-semibold">+12%</span>
                <span className="text-slate-400">from yesterday</span>
              </div>
            </div>
            <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
              <Ticket size={24} />
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Approval</p>
              <h3 className="text-4xl font-bold text-slate-900 mt-3">84</h3>
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <span className="text-orange-600 font-semibold">12</span>
                <span className="text-slate-400">require urgent attention</span>
              </div>
            </div>
            <div className="bg-orange-50 text-orange-600 p-4 rounded-xl">
              <Hourglass size={24} />
            </div>
          </div>
        </div>

        {/* In-Progress Issue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In-Progress Issue</p>
              <h3 className="text-4xl font-bold text-slate-900 mt-3">32</h3>
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="text-slate-400">40 assigned engineers</span>
              </div>
            </div>
            <div className="bg-purple-50 text-purple-600 p-4 rounded-xl">
              <UserCog size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GRID (Fitur Admin: Chart & Activity, Gaya Visual Branch: rounded-2xl) */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT PANEL: CHART */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col p-6">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
            <h3 className="text-lg font-semibold text-slate-900">Ticket Volume Trends</h3>
            <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1">
              <button className="px-4 py-1.5 text-xs font-semibold bg-white text-primary rounded-md shadow-sm border border-slate-200">Day</button>
              <button className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700">Week</button>
            </div>
          </div>

          {/* CSS Bar Chart Simulation */}
          <div className="flex-1 flex flex-col justify-end relative h-64">
            {/* Garis batas bawah grafik */}
            <div className="absolute bottom-0 left-0 w-full border-b border-slate-200"></div>
            
            <div className="flex items-end justify-between w-full h-full px-2 md:px-8 relative z-10 gap-2 md:gap-6">
              <div className="w-full bg-blue-100 hover:bg-blue-200 transition-colors rounded-t-md h-[20%] group relative"></div>
              <div className="w-full bg-blue-100 hover:bg-blue-200 transition-colors rounded-t-md h-[40%] group relative"></div>
              <div className="w-full bg-blue-100 hover:bg-blue-200 transition-colors rounded-t-md h-[35%] group relative"></div>
              <div className="w-full bg-blue-100 hover:bg-blue-200 transition-colors rounded-t-md h-[60%] group relative"></div>
              <div className="w-full bg-blue-200 hover:bg-blue-300 transition-colors rounded-t-md h-[85%] group relative"></div>
              <div className="w-full bg-blue-100 hover:bg-blue-200 transition-colors rounded-t-md h-[45%] group relative"></div>
              <div className="w-full bg-blue-100 hover:bg-blue-200 transition-colors rounded-t-md h-[30%] group relative"></div>
            </div>
          </div>
          
          {/* Label Hari */}
          <div className="flex justify-between px-2 md:px-8 mt-4 text-xs font-medium text-slate-500">
            <span className="w-full text-center">Mon</span>
            <span className="w-full text-center">Tue</span>
            <span className="w-full text-center">Wed</span>
            <span className="w-full text-center">Thu</span>
            <span className="w-full text-center">Fri</span>
            <span className="w-full text-center">Sat</span>
            <span className="w-full text-center">Sun</span>
          </div>
        </div>

        {/* RIGHT PANEL: RECENT ACTIVITY */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Activity 1 - Resolved */}
            <div className="flex gap-4">
              <div className="shrink-0 mt-0.5">
                <div className="w-9 h-9 rounded-full bg-[#f0fdf4] flex items-center justify-center border border-green-100 text-green-600">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">#TKT-4921 resolved by J. Doe</p>
                <p className="text-xs text-slate-500 mt-1">2 mins ago</p>
              </div>
            </div>

            {/* Activity 2 - Started */}
            <div className="flex gap-4">
              <div className="shrink-0 mt-0.5">
                <div className="w-9 h-9 rounded-full bg-[#eff6ff] flex items-center justify-center border border-blue-100 text-blue-500">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">#TKT-4925 started by Brian</p>
                <p className="text-xs text-slate-500 mt-1">15 mins ago</p>
              </div>
            </div>

            {/* Activity 3 - Started */}
            <div className="flex gap-4">
              <div className="shrink-0 mt-0.5">
                <div className="w-9 h-9 rounded-full bg-[#eff6ff] flex items-center justify-center border border-blue-100 text-blue-500">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">#TKT-4921 started by J. Doe</p>
                <p className="text-xs text-slate-500 mt-1">2 hrs ago</p>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}