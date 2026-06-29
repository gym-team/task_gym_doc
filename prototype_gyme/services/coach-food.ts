import { api } from "./api";
import {
  CoachFoodCategory,
  type CoachFood,
  type CoachFoodCreateDto,
  type CoachFoodDetail,
  type CoachFoodListParams,
  type CoachFoodUpdateDto,
  type CoachPagedResult,
} from "@/types/coach-food";

const categoryMap: Record<string, number> = {
  Protein: 0,
  Carbohydrate: 1,
  Fat: 2,
  Vegetable: 3,
  Fruit: 4,
  Dairy: 5,
  Legume: 6,
  Supplement: 7,
  Other: 8,
};

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

function normalizeCategoryValue(category: CoachFoodCategory | string | number): number {
  if (typeof category === "number") return category;
  return categoryMap[category] ?? Number(category) ?? 0;
}

function toPutPayload(payload: CoachFoodCreateDto | CoachFoodUpdateDto) {
  return {
    name: payload.name,
    category: normalizeCategoryValue(payload.category),
    caloriesPer100g: payload.caloriesPer100g,
    proteinPer100g: payload.proteinPer100g,
    carbPer100g: payload.carbPer100g,
    fatPer100g: payload.fatPer100g,
    fiberPer100g: payload.fiberPer100g ?? 0,
    servingSizeG: payload.servingSizeG,
    servingSizeName: payload.servingSizeName,
    isWhole: Boolean(payload.isWhole),
  };
}

export async function getCoachFoods(
  params?: CoachFoodListParams
): Promise<CoachPagedResult<CoachFood>> {
  try {
    return await api.get<CoachPagedResult<CoachFood>>("/api/fooditem", params);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load food items."));
  }
}

export async function getCoachFoodById(id: number): Promise<CoachFoodDetail> {
  try {
    return await api.get<CoachFoodDetail>(`/api/fooditem/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load food item details."));
  }
}

export async function createCoachFood(
  payload: CoachFoodCreateDto
): Promise<{ id: number }> {
  try {
    return await api.post<{ id: number }>("/api/fooditem", {
      name: payload.name,
      category: normalizeCategoryValue(payload.category),
      caloriesPer100g: payload.caloriesPer100g,
      proteinPer100g: payload.proteinPer100g,
      carbPer100g: payload.carbPer100g,
      fatPer100g: payload.fatPer100g,
      fiberPer100g: payload.fiberPer100g ?? 0,
      servingSizeG: payload.servingSizeG,
      servingSizeName: payload.servingSizeName,
      isWhole: Boolean(payload.isWhole),
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create food item."));
  }
}

export async function updateCoachFood(
  id: number,
  payload: CoachFoodUpdateDto
): Promise<{ message: string }> {
  try {
    return await api.put<{ message: string }>(
      `/api/fooditem/${id}`,
      toPutPayload(payload)
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update food item."));
  }
}

export async function deleteCoachFood(
  id: number
): Promise<{ message: string }> {
  try {
    return await api.delete<{ message: string }>(`/api/fooditem/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete food item."));
  }
}

export function getCategoryLabel(category: CoachFoodCategory | number | string) {
  const numeric =
    typeof category === "string"
      ? categoryMap[category] ?? Number(category)
      : category;

  switch (numeric) {
    case 0:
      return "Protein";
    case 1:
      return "Carbohydrate";
    case 2:
      return "Fat";
    case 3:
      return "Vegetable";
    case 4:
      return "Fruit";
    case 5:
      return "Dairy";
    case 6:
      return "Legume";
    case 7:
      return "Supplement";
    case 8:
      return "Other";
    default:
      return String(category);
  }
}

export function normalizeCategoryForForm(
  category: CoachFoodCategory | string | number
): CoachFoodCategory {
  if (typeof category === "number") return category as CoachFoodCategory;
  if (typeof category === "string" && category in categoryMap) {
    return categoryMap[category] as CoachFoodCategory;
  }
  return (Number(category) || 0) as CoachFoodCategory;
}