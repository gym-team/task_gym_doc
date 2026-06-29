// types/dashboard.ts
// Aggregated client-side view model for the /coach dashboard page.
// Derived from CoachNutritionPlan[] and CoachCheckInQueueItem[] already fetched
// via existing endpoints — no separate dashboard endpoint exists in the brief.
// If a dedicated GET /api/coach/dashboard (or similar) is introduced later,
// replace this with the real response shape (Direct Rule, section 12).

export interface CoachDashboardSummary {
  totalPlans: number;
  publishedPlans: number;
  draftPlans: number;
  queueCount: number;
  escalatedCount: number;
}
