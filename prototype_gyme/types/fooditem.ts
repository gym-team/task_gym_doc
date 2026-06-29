// Food Category Enum
export enum FoodCategory {
  Protein = 0,
  Carbohydrate = 1,
  Fat = 2,
  Vegetable = 3,
  Fruit = 4,
  Dairy = 5,
  Legume = 6,
}

// Mapping from string to numeric enum for API requests
export const foodCategoryMap: Record<string, number> = {
  Protein: 0,
  Carbohydrate: 1,
  Fat: 2,
  Vegetable: 3,
  Fruit: 4,
  Dairy: 5,
  Legume: 6,
}

// Reverse mapping for display
export const reverseFoodCategoryMap: Record<number, string> = {
  0: 'Protein',
  1: 'Carbohydrate',
  2: 'Fat',
  3: 'Vegetable',
  4: 'Fruit',
  5: 'Dairy',
  6: 'Legume',
}

// Food Item (API response returns numeric category)
export interface FoodItem {
  id: number
  name: string
  category: number
  caloriesPer100g: number
  proteinPer100g: number
  carbPer100g: number
  fatPer100g: number
  fiberPer100g: number
  servingSizeG: number
  servingSizeName: string
  isWhole: boolean
  isGlobal: boolean
}

// Create/Update request expects numeric category
export interface FoodItemCreateInput {
  name: string
  category: number
  caloriesPer100g: number
  proteinPer100g: number
  carbPer100g: number
  fatPer100g: number
  fiberPer100g: number
  servingSizeG: number
  servingSizeName: string
  isWhole: boolean
}

export interface FoodItemUpdateInput extends Partial<FoodItemCreateInput> {}

// Food list response with pagination
export interface FoodItemList {
  pageIndex: number
  pageSize: number
  totalCount: number
  data: FoodItem[]
}
