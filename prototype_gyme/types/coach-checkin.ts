export type CoachCheckInDecisionType = 0 | 1 | 2 | 3;
export type CoachAdjustmentVectorType = 0 | 1 | 2 | 3;
export type CoachNoteActionType = 0 | 1 | 2;

export type ReviewPriorityLabel =
  | "Escalated"
  | "Proposal"
  | "OnTrack"
  | "NoCheckIn"
  | string;

export type NoteCategoryLabel =
  | "Health"
  | "LifeEvent"
  | "Feedback"
  | "General"
  | string
  | null;

export type ProposalConfidenceLabel = "High" | "Medium" | "Low" | string | null;

export interface CoachCheckInQueueItem {
  enrollmentId: number;
  checkInId: number; // 0 if no check-in submitted
  traineeName: string;
  planName: string;
  weekNumber: number;
  totalWeeks: number;
  priority: number;
  priorityLabel: ReviewPriorityLabel;
  averageWeight: number | null;
  weightDeltaKg: number | null;
  adherencePercent: number | null;
  hasClientNote: boolean;
  noteCategory: NoteCategoryLabel;
  proposedAdjustmentKcal: number | null;
  systemConfidence: ProposalConfidenceLabel;
  submittedAt?: string | null;
}

export interface CoachCheckInHistoryItem {
  weekNumber: number;
  averageWeight: number | null;
  caloriesApplied: number | null;
}

export interface CoachCheckInDetails {
  checkInId: number;
  enrollmentId: number;
  traineeName: string;
  weekNumber: number;
  averageWeight: number | null;
  weightDeltaKg: number | null;
  expectedMin: number | null;
  expectedMax: number | null;
  energyLevel: number | null;
  hungerLevel: number | null;
  sleepQuality: number | null;
  adherencePercent: number | null;
  clientNote: string | null;
  noteCategory: NoteCategoryLabel;
  systemProposalKcal: number | null;
  systemProposalReasoning: string | null;
  systemConfidence: ProposalConfidenceLabel;
  projectedOutcomeIfNoAction: string | null;
  weightHistory: CoachCheckInHistoryItem[];
}

export interface CoachCheckInDecisionPayload {
  decision: CoachCheckInDecisionType;
  finalAdjustmentKcal: number | null;
  appliedAdjustmentVector: CoachAdjustmentVectorType;
  noteAction: CoachNoteActionType;
  coachNote: string;
}