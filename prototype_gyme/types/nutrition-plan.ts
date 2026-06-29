// Enums for API request
export enum TrainingGoal {
  LoseFat = 0,
  BuildMuscle = 1,
  Maintain = 2,
}

export enum FitnessLevel {
  Beginner = 0,
  Intermediate = 1,
  Advanced = 2,
}

export enum EquipmentType {
  FullGym = 0,
  Bodyweight = 1,
  HomeEquipment = 2,
}

export enum CalorieStrategyType {
  Deficit = 0,
  Maintenance = 1,
  Surplus = 2,
}

// Nutrition Plan - Coach list response (GET returns strings for enums)
export interface NutritionPlan {
  id: number
  name: string
  description: string
  expectedOutcome: string
  coachName: string
  coachRating: number
  trainingGoal: string
  fitnessLevel: string
  equipmentType: string
  durationOnWeeks: number
  isPublished: boolean
  isLinkedToProgram: boolean
  photoThumbnailUrl: string | null
}

export interface NutritionPlanCreateInput {
  linkedWorkoutProgramID?: number
  name: string
  description: string
  expectedOutcome: string
  nextSteps?: string
  trainingGoal: number
  fitnessLevel: number
  equipmentType: number
  calorieStrategyType?: number
  durationOnWeeks: number
  tdeeAdjustmentKcal?: number
  absoluteCalorieTarget?: number
  proteinTargetPerKg?: number
  photoThumbnailUrl?: string
}

export interface NutritionPlanUpdateInput extends Partial<NutritionPlanCreateInput> {}

// Nutrition Plan - Details response (GET /api/NutritionPlan/{id})
// Note: field names differ from the list response above
// (calorieStrategy instead of calorieStrategyType, nutritionWeeks instead of weeks,
// no trackName field exists on this endpoint)
export interface NutritionWeek {
  id: number
  weekNumber?: number
  weekDescription?: string
  focusArea?: string
}

export interface NutritionPlanDetails {
  id: number
  name: string
  description: string
  expectedOutcome: string
  nextSteps: string
  coachName: string
  coachRating: number
  trainingGoal: string
  fitnessLevel: string
  equipmentType: string
  calorieStrategy: string
  tdeeAdjustmentKcal: number
  absoluteCalorieTarget: number
  proteinTargetPerKg: number
  durationOnWeeks: number
  isPublished: boolean
  isLinkedToProgram: boolean
  linkedWorkoutProgramID: number | null
  nutritionWeeks: NutritionWeek[]
  photoThumbnailUrl: string | null
}

// Mapping functions to convert between string (API response) and number (API request)
export const trainingGoalMap: Record<string, number> = {
  LoseFat: 0,
  BuildMuscle: 1,
  Maintain: 2,
}

export const fitnessLevelMap: Record<string, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
}

export const equipmentTypeMap: Record<string, number> = {
  FullGym: 0,
  Bodyweight: 1,
  HomeEquipment: 2,
}

export const calorieStrategyMap: Record<string, number> = {
  Deficit: 0,
  Maintenance: 1,
  Surplus: 2,
}

// Reverse mapping for display
export const reverseTrainingGoalMap: Record<number, string> = {
  0: 'LoseFat',
  1: 'BuildMuscle',
  2: 'Maintain',
}

export const reverseFitnessLevelMap: Record<number, string> = {
  0: 'Beginner',
  1: 'Intermediate',
  2: 'Advanced',
}

export const reverseEquipmentTypeMap: Record<number, string> = {
  0: 'FullGym',
  1: 'Bodyweight',
  2: 'HomeEquipment',
}