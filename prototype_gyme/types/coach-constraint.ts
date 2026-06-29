export interface CoachNutritionConstraint {
  id?: number;
  enrollmentID: number;
  weightAveragingDays: number;
  expectedWeeklyChangeMin: number;
  expectedWeeklyChangeMax: number;
  deviationTriggerKg: number;
  proteinFloorG: number;
  fatFloorG: number;
  calorieFloor: number;
  calorieCeiling: number;
  maxSingleAdjustmentKcal: number;
  maxCumulativeDriftKcal: number;
  preferredAdjustmentVector: "RestDayCarbs" | "TrainingDayCarbs" | "Fat" | "Proportional" | string;
  adherenceThresholdPercent: number;
  requireConsecutiveWeeksDeviation: boolean;
  applyTrainingWeekNoiseCorrection: boolean;
  energyLevelEscalationRule: boolean;
  preserveLeanMassOverRate: boolean;
  enableBaselineRecalibrationReview: boolean;
}

export interface CoachNutritionConstraintUpdateDto extends CoachNutritionConstraint {}
