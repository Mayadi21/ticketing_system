import { cookies } from "next/headers";
import { db } from "@/lib/db";
import BranchDashboard from "./BranchDashboard";

export default async function BranchDashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("ticketing_session");

  if (!session) return null;

  const sessionData = JSON.parse(session.value);
  const userId = sessionData.id ? BigInt(sessionData.id) : null;
  const branchId = sessionData.branch_id ? BigInt(sessionData.branch_id) : null;

  if (!userId || !branchId) return null;

  const userData = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, branch_id: true, branch: { select: { branch_name: true } } },
  });

  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    needApproval,
    inProgress,
    resolvedThisMonth,
    recentTicketsData
  ] = await Promise.all([
    db.problem.count({
      where: {
        affected_branch_id: branchId,
        status: "OPEN",
      },
    }),

    db.problem.count({
      where: {
        affected_branch_id: branchId,
        status: { in: ["ASSIGNED", "IN_PROGRESS"] },
      },
    }),

    db.problem.count({
      where: {
        affected_branch_id: branchId,
        status: { in: ["RESOLVED", "CLOSED"] },
        updated_at: { gte: firstDayOfMonth },
      },
    }),

    db.problem.findMany({
      where: { affected_branch_id: branchId },
      select: {
        id: true,
        ticket_no: true,
        title: true,
        status: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
  ]);

  const recentTickets = recentTicketsData.map((t) => ({
    id: Number(t.id),
    ticket_no: t.ticket_no,
    title: t.title,
    status: t.status,
    created_at: t.created_at.toISOString(),
  }));

  return (
    <BranchDashboard
      userName={userData?.name ?? ""}
      branchName={userData?.branch?.branch_name ?? ""}
      needApproval={needApproval}
      inProgress={inProgress}
      resolvedThisMonth={resolvedThisMonth}
      recentTickets={recentTickets}
    />
  );
}