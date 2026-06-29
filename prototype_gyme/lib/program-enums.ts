// These map 1:1 to the C# enums in FitZone.Core.Enums.
// The API expects the numeric value; we only show the label to the user.

export const TRAINING_GOAL_OPTIONS = [
  { value: 0, label: "Lose fat" },
  { value: 1, label: "Build muscle" },
  { value: 2, label: "Get stronger" },
  { value: 3, label: "Improve endurance" },
  { value: 4, label: "Move better" },
  { value: 5, label: "General fitness" },
  { value: 6, label: "Maintain weight" },
];

export const FITNESS_LEVEL_OPTIONS = [
  { value: 0, label: "Beginner" },
  { value: 1, label: "Intermediate" },
  { value: 2, label: "Advanced" },
];

export const EQUIPMENT_TYPE_OPTIONS = [
  { value: 0, label: "Full gym" },
  { value: 1, label: "Dumbbells" },
  { value: 2, label: "Home" },
  { value: 3, label: "Bodyweight" },
  { value: 4, label: "Bands" },
];
