// Human-readable labels for the numeric enums sent to/from the FitZone API.
// The API always works with numbers; these maps are purely for display.

export const TRAINING_GOAL_OPTIONS = [
  { value: 0, label: "Lose Fat" },
  { value: 1, label: "Build Muscle" },
  { value: 2, label: "Get Stronger" },
  { value: 3, label: "Improve Endurance" },
  { value: 4, label: "Move Better" },
  { value: 5, label: "General Fitness" },
  { value: 6, label: "Maintain Weight" },
];

export const FITNESS_LEVEL_OPTIONS = [
  { value: 0, label: "Beginner" },
  { value: 1, label: "Intermediate" },
  { value: 2, label: "Advanced" },
];

export const EQUIPMENT_TYPE_OPTIONS = [
  { value: 0, label: "Full Gym" },
  { value: 1, label: "Dumbbells" },
  { value: 2, label: "Home" },
  { value: 3, label: "Bodyweight" },
  { value: 4, label: "Bands" },
];

export const CALORIE_STRATEGY_OPTIONS = [
  { value: 0, label: "Absolute (fixed kcal target)" },
  { value: 1, label: "TDEE Relative (delta from TDEE)" },
];

export type EnumOption = { value: number; label: string };