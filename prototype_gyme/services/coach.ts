import { api } from "./api";

export const getCoachPlans = () =>
  api.get("/api/nutritionplan/coach");

export const getCoachQueue = () =>
  api.get("/api/checkin/coach/queue");

export const getDashboardSummary = () =>
  api.get("/api/dashboard/coach");