/* ============================================================
   Response Enums (GET Responses)
   ============================================================ */

export type CoachTrainingGoal =
  | "BuildMuscle"
  | "LoseFat"
  | "Maintain"
  | "Recomposition";

export type CoachFitnessLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export type CoachEquipmentType =
  | "NoEquipment"
  | "HomeGym"
  | "FullGym";

export type CoachCalorieStrategyType =
  | "Absolute"
  | "TDEERelative";

export type CoachWeekProtocolType =
  | "Standard"
  | "HighVolume"
  | "Deload"
  | "Refeed"
  | "Peak";

export type CoachMealTimingType =
  | "Breakfast"
  | "PreWorkout"
  | "PostWorkout"
  | "Lunch"
  | "Snack"
  | "Dinner"
  | "BeforeBed";

/* ============================================================
   Request Enums (POST / PUT)
   ============================================================ */

export type CoachTrainingGoalValue =
  | 0 // BuildMuscle
  | 1 // LoseFat
  | 2 // Maintain
  | 3; // Recomposition

export type CoachFitnessLevelValue =
  | 0 // Beginner
  | 1 // Intermediate
  | 2; // Advanced

export type CoachEquipmentTypeValue =
  | 0 // NoEquipment
  | 1 // HomeGym
  | 2; // FullGym

export type CoachCalorieStrategyValue =
  | 0 // Absolute
  | 1; // TDEERelative

export type CoachWeekProtocolValue =
  | 0 // Standard
  | 1 // HighVolume
  | 2 // Deload
  | 3 // Refeed
  | 4; // Peak

export type CoachMealTimingValue =
  | 0 // Breakfast
  | 1 // PreWorkout
  | 2 // PostWorkout
  | 3 // Lunch
  | 4 // Snack
  | 5 // Dinner
  | 6; // BeforeBed

/* ============================================================
   Cards
   ============================================================ */

export interface CoachNutritionPlanCard {
  id: number;
  name: string;
  description: string;
  expectedOutcome: string;
  coachName: string;
  coachRating: number;

  trainingGoal: CoachTrainingGoal;
  fitnessLevel: CoachFitnessLevel;
  equipmentType: CoachEquipmentType;

  durationOnWeeks: number;

  isPublished: boolean;
  isLinkedToProgram: boolean;

  photoThumbnailUrl: string | null;
}

/* ============================================================
   Week Summary
   ============================================================ */

export interface CoachNutritionWeekSummary {
  weekNumber: number;
  weekProtocolType: CoachWeekProtocolType;

  calorieModifier: number;

  weekDescription: string;
  focusNote: string;
  progressionNote: string;
  nextWeekPreview: string;

  dayProtocolCount: number;
}

/* ============================================================
   Detail
   ============================================================ */

export interface CoachNutritionPlanDetail
  extends CoachNutritionPlanCard {
  nextSteps: string;

  calorieStrategy: CoachCalorieStrategyType;

  tdeeAdjustmentKcal: number | null;
  absoluteCalorieTarget: number | null;
  proteinTargetPerKg: number | null;

  linkedWorkoutProgramID: number | null;

  nutritionWeeks: CoachNutritionWeekSummary[];
}

/* ============================================================
   Create / Update DTO
   ============================================================ */

export interface CoachMealFoodItemDraft {
  foodItemId: number;
  amountGrams: number;
  isOptional: boolean;
}

export interface CoachMealDraft {
  name: string;

  timingType: CoachMealTimingValue;

  mealOrder: number;

  timeFromTrainingMinutes: number;

  targetCalories: number;
  targetProteinG: number;
  targetCarbG: number;
  targetFatG: number;

  notes: string;

  foodItems: CoachMealFoodItemDraft[];
}

export interface CoachWeekDraft {
  weekNumber: number;

  weekProtocolType: CoachWeekProtocolValue;

  calorieModifier: number;

  weekDescription: string;
  focusNote: string;
  progressionNote: string;
  nextWeekPreview: string;

  meals: CoachMealDraft[];
}

export interface CoachNutritionPlanCreateDto {
  name: string;
  description: string;
  expectedOutcome: string;

  trainingGoal: CoachTrainingGoalValue;
  fitnessLevel: CoachFitnessLevelValue;
  equipmentType: CoachEquipmentTypeValue;

  durationOnWeeks: number;

  calorieStrategy: CoachCalorieStrategyValue;

  tdeeAdjustmentKcal: number | null;
  absoluteCalorieTarget: number | null;

  proteinTargetPerKg: number | null;

  linkedWorkoutProgramID: number | null;

  nutritionWeeks: CoachWeekDraft[];
}

export interface CoachNutritionPlanUpdateDto
  extends CoachNutritionPlanCreateDto {}