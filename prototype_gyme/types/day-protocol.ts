import { Meal } from "./meal";

export interface DayProtocol {
  id: number;
  dayProtocolType: string;
  weekDay: string;
  dayOrder: number;
  totalCaloriesTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  protocolNotes: string;
  linkedWorkoutSessionID: number | null;
  meals: Meal[];
}