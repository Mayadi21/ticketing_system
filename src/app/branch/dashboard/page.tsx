import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import BranchDashboard from "./BranchDashboard";

export default async function BranchDashboardPage() {
    const cookieStore = await cookies();

    const session = cookieStore.get("ticketing_session");

    if (!session) return null;

    const sessionData = JSON.parse(session.value);

    const branchId = sessionData.branch_id;

    const supabase = await createClient();

    // ambil nama user
const { data: userData } = await supabase
  .from("user")
  .select("name, branch_id")
  .eq("id", sessionData.user_id)
  .single();

const { data: branchData } = await supabase
  .from("branch")
  .select("branch_name")
  .eq("id", userData?.branch_id)
  .single();

    const [
        { count: needApproval },
        { count: inProgress },
        { count: resolvedThisMonth },
        { data: recentTickets }
    ] = await Promise.all([

        supabase
            .from("problem")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("affected_branch_id", branchId)
            .eq("status", "OPEN"),

        supabase
            .from("problem")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("affected_branch_id", branchId)
            .in("status", ["ASSIGNED", "IN_PROGRESS"]),

        supabase
            .from("problem")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("affected_branch_id", branchId)
            .in("status", ["RESOLVED", "CLOSED"])
            .gte(
                "updated_at",
                new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1
                ).toISOString()
            ),

        supabase
            .from("problem")
            .select(`
                id,
                ticket_no,
                title,
                status,
                created_at
            `)
            .eq("affected_branch_id", branchId)
            .order("created_at", {
                ascending: false
            })
            .limit(5)

    ]);

return (
    <BranchDashboard
        userName={userData?.name ?? ""}
        branchName={branchData?.branch_name ?? ""}
        needApproval={needApproval ?? 0}
        inProgress={inProgress ?? 0}
        resolvedThisMonth={resolvedThisMonth ?? 0}
        recentTickets={recentTickets ?? []}
    />
);
}