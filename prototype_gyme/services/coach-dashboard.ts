import type { CoachDashboard, CoachDashboardActivity } from "@/types/coach-dashboard";
import { getCoachPlans } from "@/services/coach-plan";
import { getCoachQueue } from "@/services/coach-checkin";

function uniqueCount(values: Array<string | number>) {
  return new Set(values).size;
}

export async function getCoachDashboard(): Promise<CoachDashboard> {
  const [plans, queue] = await Promise.all([getCoachPlans(), getCoachQueue()]);

  const activePlans = plans.filter((plan) => plan.isPublished).length;
  const totalActiveClients = uniqueCount(queue.map((item) => item.enrollmentId));
  const pendingCheckIns = queue.length;

  const recentActivity: CoachDashboardActivity[] = queue
    .slice(0, 6)
    .map((item) => ({
      id: item.checkInId,
      title: `${item.traineeName} submitted week ${item.weekNumber}`,
      description: `${item.planName} · ${item.priorityLabel} review · ${item.adherencePercent ?? 0}% adherence`,
      createdAt: item.submittedAt ?? null,
      type: "CheckIn",
      clientName: item.traineeName,
      enrollmentId: item.enrollmentId,
    }));

  return {
    stats: {
      totalActiveClients,
      activePlans,
      pendingCheckIns,
      recentActivityCount: recentActivity.length,
    },
    recentActivity,
  };
}
