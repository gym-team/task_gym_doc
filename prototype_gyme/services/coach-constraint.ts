import { api } from "./api";
import type {
  CoachNutritionConstraint,
  CoachNutritionConstraintUpdateDto,
} from "@/types/coach-constraint";

export async function getCoachConstraints(
  enrollmentId: number
): Promise<CoachNutritionConstraint> {
  return api.get<CoachNutritionConstraint>(
    `/api/nutritionconstraint/${enrollmentId}`
  );
}

export async function updateCoachConstraints(
  enrollmentId: number,
  payload: CoachNutritionConstraintUpdateDto
): Promise<{ message: string }> {
  return api.put<{ message: string }>(
    `/api/nutritionconstraint/${enrollmentId}`,
    payload
  );
}
