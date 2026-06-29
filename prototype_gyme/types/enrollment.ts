export interface Enrollment {
  id: number;
  nutritionPlanID: number;
  planName: string;
  coachName?: string;

  totalWeeks?: number;

  status: string; // Active | Completed | Cancelled
  baselineCalories: number;
  currentAdjustedKcal: number;
  maxWeekUnlocked: number;

  pendingCheckIn?: boolean;
  pendingCoachReview?: boolean;

  
startDate:string;
  completedAt?: string;
  linkedWorkoutEnrollmentId?: number;
}

export interface TdeePreviewResult {
  planId: number;
  planName: string;

  bmr: number;
  tdee: number;
  adjustedCalories: number;

  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;

  activityLevel?: string;
  goal?: string;
  calculationMethod?: string;
  methodLabel?: string;
}