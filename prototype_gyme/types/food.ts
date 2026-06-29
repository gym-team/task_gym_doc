export interface Food {
  id: number;
  foodItemID: number;
  foodName: string;
  category: string;
  amountGrams: number;
  isOptional: boolean;
  swapGroupID: number | null;
  macroCalories: number;
  macroProteinG: number;
  macroCarbG: number;
  macroFatG: number;
}