// src/app/admin/dashboard/page.tsx

import { db } from "@/lib/db";
import { getCurrentUser } from "@/app/actions/auth";
import DashboardUI, { DashboardData } from "./DashboardUI";
import { formatDateToWIB, getShortDayNameWIB } from "@/utils/date";

export default async function AdminDashboardPage() {
  // ====================================================
  // USER
  // ====================================================

  let adminName = "Admin";
  const currentUser = await getCurrentUser();
  if (currentUser?.name) {
    adminName = currentUser.name;
  }

  // ====================================================
  // DATE RANGE
  // ====================================================

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // ====================================================
  // FETCH DATA
  // ====================================================

  const [
    totalTickets,
    pendingApproval,
    urgentAttention,
    inProgress,
    engineersData,
    recentTickets,
  ] = await Promise.all([
    db.problem.count(),

    db.problem.count({
      where: { status: "OPEN" },
    }),

    db.problem.count({
      where: { priority: "HIGH" },
    }),

    db.problem.count({
      where: { status: "IN_PROGRESS" },
    }),

    db.problem_eng.findMany({
      where: {
        problem: {
          status: "IN_PROGRESS",
        },
      },
      select: {
        engineer_id: true,
      },
    }),

    db.problem.findMany({
      where: {
        created_at: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        created_at: true,
      },
      orderBy: {
        created_at: "asc",
      },
    }),
  ]);

  // ====================================================
  // ENGINEERS
  // ====================================================

  const assignedEngineers = new Set(
    engineersData.map((item) => item.engineer_id.toString())
  ).size;

  // ====================================================
  // CHART DATA
  // ====================================================

  const labels: string[] = [];
  const dates: string[] = [];
  const counts = Array(7).fill(0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);

    dates.push(formatDateToWIB(d));
    labels.push(getShortDayNameWIB(d));
  }

  recentTickets.forEach((ticket) => {
    const ticketDateObj = new Date(ticket.created_at);
    const ticketDate = formatDateToWIB(ticketDateObj);

    const index = dates.indexOf(ticketDate);

    if (index !== -1) {
      counts[index]++;
    }
  });

  // ====================================================
  // GROWTH
  // ====================================================

  const todayCount = counts[6];
  const yesterdayCount = counts[5];

  let ticketsGrowth = 0;

  if (yesterdayCount > 0) {
    ticketsGrowth = Math.round(
      ((todayCount - yesterdayCount) / yesterdayCount) * 100
    );
  } else if (todayCount > 0) {
    ticketsGrowth = 100;
  }

  // ====================================================
  // NORMALIZE CHART
  // ====================================================

  const maxVolume = Math.max(...counts, 1);

  const chartData = counts.map((count, index) => ({
    label: labels[index],
    volume: count,
    percentage:
      count === 0
        ? 6
        : Math.max(
            Math.round((count / maxVolume) * 100),
            12
          ),
  }));

  // ====================================================
  // DATA
  // ====================================================

  const dashboardData: DashboardData = {
    adminName,
    totalTickets: totalTickets ?? 0,
    ticketsGrowth,
    pendingApproval: pendingApproval ?? 0,
    urgentAttention: urgentAttention ?? 0,
    inProgress: inProgress ?? 0,
    assignedEngineers,
    chartData,
  };

  return <DashboardUI data={dashboardData} />;
}