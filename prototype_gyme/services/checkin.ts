import { api } from "./api";

/* ------------------------------------------------------------------ */
/* Trainee Types                                                      */
/* ------------------------------------------------------------------ */

export interface CheckInPayload {
  morningWeight1: number;
  morningWeight2?: number;
  morningWeight3?: number;
  energyLevel: number;
  hungerLevel: number;
  sleepQuality: number;
  adherencePercent: number;
  clientNote?: string;
  noteCategory?: number;
}

export interface CheckInSubmitResponse {
  checkInId: number;
  weekNumber: number;
  averageWeight: number;
  message: string;
  coachReviewPending: boolean;
}

export interface CheckInHistoryItem {
  weekNumber: number;
  submittedAt: string;
  averageWeight: number;
  energyLevel: number;
  hungerLevel: number;
  sleepQuality: number;
  adherencePercent: number;
  caloriesApplied: number;
  adjustmentKcal: number | null;
  coachDirectiveNote: string | null;
  coachReviewed: boolean;
}

/* ------------------------------------------------------------------ */
/* Coach Types                                                        */
/* ------------------------------------------------------------------ */

export interface CoachCheckInQueueItem {
  enrollmentId: number;
  checkInId: number;
  traineeName: string;
  planName: string;
  weekNumber: number;
  totalWeeks: number;
  priority: number;
  priorityLabel: string;
  averageWeight: number;
  weightDeltaKg: number | null;
  adherencePercent: number;
  hasClientNote: boolean;
  noteCategory: string;
  proposedAdjustmentKcal: number;
  systemConfidence: string;
}

export interface CoachWeightHistoryPoint {
  weekNumber: number;
  averageWeight: number;
  caloriesApplied: number;
}

export interface CoachCheckInDetails {
  checkInId: number;
  enrollmentId: number;
  traineeName: string;
  weekNumber: number;
  averageWeight: number;
  weightDeltaKg: number;
  expectedMin: number;
  expectedMax: number;
  energyLevel: number;
  hungerLevel: number;
  sleepQuality: number;
  adherencePercent: number;
  clientNote: string;
  noteCategory: string;
  systemProposalKcal: number;
  systemProposalReasoning: string;
  systemConfidence: string;
  projectedOutcomeIfNoAction: string;
  weightHistory: CoachWeightHistoryPoint[];
}

export interface CoachCheckInDecision {
  decision: "approve" | "modify" | "override" | "defer";
  adjustmentKcal?: number;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/* Trainee APIs                                                       */
/* ------------------------------------------------------------------ */

export const submitCheckIn = (
  enrollmentId: number,
  data: CheckInPayload
) =>
  api.post<CheckInSubmitResponse>(
    `/api/checkin/${enrollmentId}`,
    data
  );

export const getCheckInHistory = (
  enrollmentId: number
) =>
  api.get<CheckInHistoryItem[]>(
    `/api/checkin/${enrollmentId}/history`
  );

/* ------------------------------------------------------------------ */
/* Coach APIs                                                         */
/* ------------------------------------------------------------------ */

export const getQueue = () =>
  api.get<CoachCheckInQueueItem[]>(
    "/api/checkin/coach/queue"
  );

export const getCheckInDetails = (
  checkInId: number
) =>
  api.get<CoachCheckInDetails>(
    `/api/checkin/coach/${checkInId}`
  );

export const submitDecision = (
  checkInId: number,
  data: CoachCheckInDecision
) =>
  api.post(
    `/api/checkin/coach/${checkInId}/decide`,
    data
  );

export const manualUnlock = (
  enrollmentId: number
) =>
  api.post(
    `/api/checkin/coach/enrollment/${enrollmentId}/manual-unlock`
  );