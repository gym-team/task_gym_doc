// types/constraints.ts
// Source of truth: GET /api/nutritionconstraint/{id}
// Field names and casing mirror the live API exactly. Do not rename fields here.
// preferredAdjustmentVector is returned as a number (string enums are not converted
// to numeric in the UI layer per brief section 5 — this field is numeric at the source).

export interface NutritionConstraint {
  id: number;
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
  preferredAdjustmentVector: number;
  adherenceThresholdPercent: number;
  requireConsecutiveWeeksDeviation: boolean;
  applyTrainingWeekNoiseCorrection: boolean;
  energyLevelEscalationRule: boolean;
  preserveLeanMassOverRate: boolean;
  enableBaselineRecalibrationReview: boolean;
}

/**
 * Payload shape for editing constraints via constraints-form.
 * id is server-assigned; enrollmentID is supplied by the calling context.
 */
export type NutritionConstraintInput = Omit<NutritionConstraint, "id">;
