export enum CoachFoodCategory {
  Protein = 0,
  Carbohydrate = 1,
  Fat = 2,
  Vegetable = 3,
  Fruit = 4,
  Dairy = 5,
  Legume = 6,
  Supplement = 7,
  Other = 8,
}

export interface CoachFood {
  id: number;
  name: string;
  category: CoachFoodCategory | string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
  servingSizeG: number;
  servingSizeName: string;
  isGlobal: boolean;
}

export interface CoachFoodDetail extends CoachFood {
  fiberPer100g: number;
  isWhole: boolean;
}

export interface CoachFoodCreateDto {
  name: string;
  category: CoachFoodCategory | string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  servingSizeG: number;
  servingSizeName: string;
  isWhole?: boolean;
}

export interface CoachFoodUpdateDto extends CoachFoodCreateDto {}

export interface CoachPagedResult<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}

export interface CoachFoodListParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}