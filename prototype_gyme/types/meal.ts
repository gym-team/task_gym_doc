import { Food } from "./food";

export interface Meal {
  id: number;
  name: string;
  timingType: string;
  mealOrder: number;
  timeFromTrainingMinutes: number | null;
  targetCalories: number;
  targetProteinG: number;
  targetCarbG: number;
  targetFatG: number;
  notes: string;
  Food: Food[];
}