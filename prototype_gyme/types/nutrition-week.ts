import { DayProtocol } from "./day-protocol";

export interface NutritionWeek {
  weekNumber: number;

  weekProtocolType: string;

  weekDescription: string;

  focusNote: string;

  progressionNote: string;

  nextWeekPreview: string;

  isUnlocked: boolean;

  coachDirectiveNote: string | null;

  dayProtocols: DayProtocol[];
}