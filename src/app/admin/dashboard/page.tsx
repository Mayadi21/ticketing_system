// src/app/admin/dashboard/page.tsx

import { createClient } from "@/utils/supabase/server";
import DashboardUI, { DashboardData } from "./DashboardUI";
import { formatDateToWIB, getShortDayNameWIB } from "@/utils/date";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // ====================================================
  // USER
  // ====================================================

  let adminName = "Admin";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const { data: userData } = await supabase
      .from("user")
      .select("name")
      .eq("email", user.email)
      .single();

    if (userData) {
      adminName = userData.name;
    }
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
    { count: totalTickets },
    { count: pendingApproval },
    { count: urgentAttention },
    { count: inProgress },
    { data: engineersData },
    { data: recentTickets },
  ] = await Promise.all([
    supabase.from("problem").select("*", {
      count: "exact",
      head: true,
    }),

    supabase
      .from("problem")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "OPEN"),

    supabase
      .from("problem")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("priority", "HIGH"),

    supabase
      .from("problem")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "IN_PROGRESS"),

    // PERBAIKAN DI SINI: Join dengan tabel problem dan filter statusnya
    supabase
      .from("problem_eng")
      .select("engineer_id, problem!inner(status)")
      .eq("problem.status", "IN_PROGRESS"),

    supabase
      .from("problem")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at"),
  ]);



  // ====================================================
  // ENGINEERS
  // ====================================================

  const assignedEngineers = new Set(
    engineersData?.map((item) => item.engineer_id)
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

  recentTickets?.forEach((ticket) => {
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