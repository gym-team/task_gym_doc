import { api } from "./api";
import type {
  FoodItem,
  FoodItemCreateInput,
  FoodItemList,
} from "@/types/fooditem";

export const getFoodList = (
  page: number = 1,
  pageSize: number = 50
) =>
  api.get<FoodItemList>(
    "/api/FoodItem",
    {
      page,
      pageSize,
    }
  );

export const createFood = (
  data: FoodItemCreateInput
) =>
  api.post<FoodItem>(
    "/api/FoodItem",
    data
  );

export const updateFood = (
  id: number,
  data: Partial<FoodItemCreateInput>
) =>
  api.put<FoodItem>(
    `/api/FoodItem/${id}`,
    data
  );

export const deleteFood = (
  id: number
) =>
  api.delete<void>(
    `/api/FoodItem/${id}`
  );