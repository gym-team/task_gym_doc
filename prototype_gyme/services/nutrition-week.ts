import { api } from "./api";

export const getWeekDetails = (
  enrollmentId: number,
  weekNumber: number
) =>
  api.get(
    `/api/nutritionenrollment/${enrollmentId}/weeks/${weekNumber}`
  );