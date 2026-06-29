import { api } from "./api";
import type {
  NutritionConstraint,
  NutritionConstraintInput,
} from "@/types/constraints";

export const getConstraints = (
  id: number
) =>
  api.get<NutritionConstraint>(
    `/api/nutritionconstraint/${id}`
  );

export const getConstraintsByEnrollment = (
  enrollmentId: number
) =>
  api.get<NutritionConstraint>(
    `/api/nutritionconstraint/by-enrollment/${enrollmentId}`
  );

export const updateConstraints = (
  id: number,
  input: NutritionConstraintInput
) =>
  api.put<NutritionConstraint>(
    `/api/nutritionconstraint/${id}`,
    input
  );