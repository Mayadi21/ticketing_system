// src/app/admin/dashboard/DashboardUI.tsx
import { Ticket, Hourglass, UserCog, TrendingUp, TrendingDown } from "lucide-react";

// Interface ini memastikan tipe data yang dikirim dari page.tsx sesuai
export interface DashboardData {
    adminName: string;
    totalTickets: number;
    ticketsGrowth: number;
    pendingApproval: number;
    urgentAttention: number;
    inProgress: number;
    assignedEngineers: number;
    chartData: { label: string; volume: number; percentage: number }[];
}

export default function DashboardUI({ data }: { data: DashboardData }) {
    // Menentukan warna dan ikon berdasarkan tren pertumbuhan tiket
    const isGrowthPositive = data.ticketsGrowth >= 0;
    const GrowthIcon = isGrowthPositive ? TrendingUp : TrendingDown;
    const growthColorText = isGrowthPositive ? "text-blue-600" : "text-green-600";

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* GREETING SECTION */}
            <section>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Selamat datang, {data.adminName}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Berikut adalah ringkasan tiket dan tren pertumbuhan untuk membantu Anda memantau kinerja tim.
                    </p>
                </div>
            </section>

            {/* KPI CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Tickets */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Tiket</p>
                            <h3 className="text-4xl font-bold text-slate-900 mt-3">{data.totalTickets.toLocaleString()}</h3>
                            <div className="mt-3 flex items-center gap-1.5 text-xs">
                                <GrowthIcon size={14} className={growthColorText} />
                                <span className={`${growthColorText} font-semibold`}>
                                    {isGrowthPositive ? "+" : ""}{data.ticketsGrowth}%
                                </span>
                                <span className="text-slate-400">dari kemarin</span>
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
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tiket Terbuka</p>
                            <h3 className="text-4xl font-bold text-slate-900 mt-3">{data.pendingApproval}</h3>
                            <div className="mt-3 flex items-center gap-1.5 text-xs">
                                <span className="text-orange-600 font-semibold">{data.urgentAttention}</span>
                                <span className="text-slate-400">prioritas tinggi</span>
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
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dalam Proses</p>
                            <h3 className="text-4xl font-bold text-slate-900 mt-3">{data.inProgress}</h3>
                            <div className="mt-3 flex items-center gap-1.5 text-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                <span className="text-slate-400">{data.assignedEngineers} engineer dialokasikan</span>
                            </div>
                        </div>
                        <div className="bg-purple-50 text-purple-600 p-4 rounded-xl">
                            <UserCog size={24} />
                        </div>
                    </div>
                </div>
            </section>

            {/* CHART SECTION */}
{/* CHART SECTION */}
<section className="grid grid-cols-1 gap-6">
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
                Tren Volume Tiket (7 Hari Terakhir)
            </h3>
        </div>

        <div className="relative h-72">

            {/* Grid */}
            <div className="absolute inset-0 flex flex-col justify-between">

                <div className="border-t border-slate-100"></div>
                <div className="border-t border-slate-100"></div>
                <div className="border-t border-slate-100"></div>
                <div className="border-t border-slate-100"></div>
                <div className="border-t border-slate-300"></div>

            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end gap-4">

                {data.chartData.map((item, index) => (

                    <div
                        key={index}
                        className="flex-1 h-full flex flex-col justify-end items-center"
                    >

                        <span className="text-xs text-slate-500 mb-2">
                            {item.volume}
                        </span>

                        <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-blue-300 transition-all duration-700 hover:opacity-90"
                            style={{
                                height: `${item.percentage}%`,
                                minHeight: "8px"
                            }}
                        />

                        <span className="mt-3 text-xs font-medium text-slate-500">
                            {item.label}
                        </span>

                    </div>

                ))}

            </div>

        </div>

    </div>
</section>
        </div>
    );
}