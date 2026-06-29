import { api } from "./api";
import type {
  CoachCheckInDecisionPayload,
  CoachCheckInDetails,
  CoachCheckInQueueItem,
} from "@/types/coach-checkin";

export async function getCoachQueue(): Promise<CoachCheckInQueueItem[]> {
  return api.get<CoachCheckInQueueItem[]>("/api/CheckIn/coach/queue");
}

export async function getCoachCheckInDetails(
  checkInId: number
): Promise<CoachCheckInDetails> {
  return api.get<CoachCheckInDetails>(`/api/CheckIn/coach/${checkInId}`);
}

export async function submitCoachCheckInDecision(
  checkInId: number,
  payload: CoachCheckInDecisionPayload
): Promise<{ message: string }> {
  return api.post<{ message: string }>(
    `/api/CheckIn/coach/${checkInId}/decide`,
    payload
  );
}

export async function manualUnlockCoachEnrollment(
  enrollmentId: number
): Promise<{ message: string }> {
  return api.post<{ message: string }>(
    `/api/CheckIn/coach/enrollment/${enrollmentId}/manual-unlock`
  );
}