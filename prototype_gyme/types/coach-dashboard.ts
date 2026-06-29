export interface CoachDashboardStats {
  totalActiveClients: number;
  activePlans: number;
  pendingCheckIns: number;
  recentActivityCount: number;
}

export interface CoachDashboardActivity {
  id: string | number;
  title: string;
  description: string;
  createdAt: string | null;
  type: "CheckIn" | "Plan" | "System" | string;
  clientName?: string | null;
  enrollmentId?: number | null;
}

export interface CoachDashboard {
  stats: CoachDashboardStats;
  recentActivity: CoachDashboardActivity[];
}
