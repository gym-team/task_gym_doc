import { api } from "./api";

export interface Enrollment {
  id: number;
  nutritionPlanID: number;
  planName: string;
  coachName: string;
  maxWeekUnlocked: number;
  totalWeeks: number;
  status: string;
  startDate: string;
  endDate: string | null;
  baselineCalories: number;
  currentAdjustedKcal: number;
  pendingCheckIn: boolean;
  pendingCoachReview: boolean;
}

export const getEnrollments = () => api.get<Enrollment[]>("/api/nutritionenrollment");

export const getEnrollmentHistory = () => api.get("/api/nutritionenrollment/history");

export const previewTDEE = (planId: number) =>
  api.get(`/api/nutritionenrollment/preview-tdee/${planId}`);

export const startEnrollment = (nutritionPlanID: number, linkedWorkoutEnrollmentID?: number) =>
  api.post("/api/nutritionenrollment/start", {
    nutritionPlanID,
    linkedWorkoutEnrollmentID,
  });

export const cancelEnrollment = (enrollmentId: number) =>
  api.delete(`/api/nutritionenrollment/${enrollmentId}`);