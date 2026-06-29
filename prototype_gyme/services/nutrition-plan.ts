import type {
  NutritionPlan,
  NutritionPlanCreateInput,
  NutritionPlanUpdateInput,
} from "@/types/nutrition-plan";

import { api } from "./api";

/* ------------------------------------------------------------------ */
/* General                                                            */
/* ------------------------------------------------------------------ */

export const getPlans = (params?: any) =>
  api.get("/api/nutritionplan", params);

export const getPlanDetails = (id: number) =>
  api.get(`/api/nutritionplan/${id}`);

/* ------------------------------------------------------------------ */
/* Coach                                                               */
/* ------------------------------------------------------------------ */

export const getCoachPlans = () =>
  api.get<NutritionPlan[]>("/api/nutritionplan/coach");

export const createPlan = (
  data: NutritionPlanCreateInput
) =>
  api.post<NutritionPlan>(
    "/api/nutritionplan",
    data
  );

export const updatePlan = (
  id: number,
  data: NutritionPlanUpdateInput
) =>
  api.put<NutritionPlan>(
    `/api/nutritionplan/${id}`,
    data
  );

export const deletePlan = (id: number) =>
  api.delete<void>(
    `/api/nutritionplan/${id}`
  );

export const publishPlan = (id: number) =>
  api.post<void>(
    `/api/nutritionplan/${id}/publish`
  );

export const unpublishPlan = (id: number) =>
  api.post<void>(
    `/api/nutritionplan/${id}/unpublish`
  );

/* ------------------------------------------------------------------ */
/* Weeks                                                               */
/* ------------------------------------------------------------------ */

export const createWeek = (
  planId: number,
  data: any
) =>
  api.post(
    `/api/nutritionplan/${planId}/weeks`,
    data
  );

export const addWeek = (
  planId: number,
  data: any
) =>
  api.post(
    `/api/nutritionplan/${planId}/weeks`,
    data
  );

export const updateWeek = (
  weekId: number,
  data: any
) =>
  api.put(
    `/api/nutritionplan/weeks/${weekId}`,
    data
  );

export const deleteWeek = (
  weekId: number
) =>
  api.delete(
    `/api/nutritionplan/weeks/${weekId}`
  );