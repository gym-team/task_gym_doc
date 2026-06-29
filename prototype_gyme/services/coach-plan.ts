import { api } from "./api";
import type {
  CoachNutritionPlanCard,
  CoachNutritionPlanCreateDto,
  CoachNutritionPlanDetail,
  CoachNutritionPlanUpdateDto,
  CoachWeekDraft,
} from "@/types/coach-plan";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const anyError = error as Record<string, any>;
    const responseData = anyError?.response?.data;

    if (responseData) {
      if (typeof responseData === "string") return responseData;

      const validationErrors = responseData.errors;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        return validationErrors[0];
      }

      return (
        responseData.message ||
        responseData.details ||
        responseData.title ||
        responseData.error ||
        fallback
      );
    }

    if (typeof anyError.message === "string") {
      const msg = anyError.message.trim();
      if (msg && msg !== "response status is 500") return msg;
    }
  }

  return fallback;
}

export async function getCoachPlans(): Promise<CoachNutritionPlanCard[]> {
  try {
    return await api.get<CoachNutritionPlanCard[]>("/api/nutritionplan/coach");
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load nutrition plans."));
  }
}

export async function getCoachPlanById(id: number): Promise<CoachNutritionPlanDetail> {
  try {
    return await api.get<CoachNutritionPlanDetail>(`/api/nutritionplan/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load plan details."));
  }
}

export async function createCoachPlan(
  payload: CoachNutritionPlanCreateDto
): Promise<{ id: number }> {
  try {
    return await api.post<{ id: number }>("/api/nutritionplan", payload);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create nutrition plan."));
  }
}

export async function updateCoachPlan(
  id: number,
  payload: CoachNutritionPlanUpdateDto
): Promise<{ message: string }> {
  try {
    // مهم: PUT هنا raw body، بدون { dto: ... }
    return await api.put<{ message: string }>(`/api/nutritionplan/${id}`, payload);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update nutrition plan."));
  }
}

export async function deleteCoachPlan(id: number): Promise<{ message: string }> {
  try {
    return await api.delete<{ message: string }>(`/api/nutritionplan/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete nutrition plan."));
  }
}

export async function publishCoachPlan(id: number): Promise<{ message: string }> {
  try {
    return await api.post<{ message: string }>(`/api/nutritionplan/${id}/publish`);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to publish plan."));
  }
}

export async function unpublishCoachPlan(id: number): Promise<{ message: string }> {
  try {
    return await api.post<{ message: string }>(`/api/nutritionplan/${id}/unpublish`);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to unpublish plan."));
  }
}

export async function addCoachPlanWeek(
  planId: number,
  week: CoachWeekDraft
): Promise<{ message: string }> {
  try {
    return await api.post<{ message: string }>(
      `/api/nutritionplan/${planId}/weeks`,
      week
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to add nutrition week."));
  }
}