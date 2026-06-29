"use client";

import { useState } from "react";
import { submitCheckIn, type CheckInPayload, type CheckInSubmitResponse } from "@/services/checkin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type NoteCategory = 0 | 1 | 2 | 3; // Health | LifeEvent | Feedback | General

interface CheckInFormProps {
  enrollmentId: number;
  weekNumber: number;
  /** Called after a successful submit so the parent can refresh data / close the modal. */
  onSuccess: (result: CheckInSubmitResponse) => void;
  /** Called when the dialog should close (cancel, backdrop click, Esc, or after success). */
  onClose: () => void;
}

const NOTE_CATEGORY_OPTIONS: { value: NoteCategory; label: string }[] = [
  { value: 0, label: "Health" },
  { value: 1, label: "Life Event" },
  { value: 2, label: "Feedback" },
  { value: 3, label: "General" },
];

const ENERGY_LABELS: Record<number, string> = {
  1: "Exhausted",
  2: "Low",
  3: "Normal",
  4: "Good",
  5: "Great",
};

const HUNGER_LABELS: Record<number, string> = {
  1: "Never hungry",
  2: "Rarely hungry",
  3: "Normal",
  4: "Often hungry",
  5: "Always hungry",
};

const SLEEP_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Poor",
  3: "Okay",
  4: "Good",
  5: "Perfect",
};

const MAX_NOTE_LENGTH = 400;
const MIN_WEIGHT_KG = 20;
const MAX_WEIGHT_KG = 500;

/* ------------------------------------------------------------------ */
/*  Small reusable bits                                               */
/* ------------------------------------------------------------------ */

function ScaleSelector({
  label,
  labels,
  value,
  onChange,
}: {
  label: string;
  labels: Record<number, string>;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/75">{label}</label>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(n)}
            className={cn(
              "flex-1 rounded-xl border py-2.5 text-sm font-bold transition-all",
              value === n
                ? "border-[#84FF00] bg-[#84FF00] text-[#050505] shadow-[0_4px_20px_rgba(132,255,0,0.25)]"
                : "border-white/10 bg-white/[0.03] text-white/55 hover:border-[#84FF00]/50 hover:text-white"
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-white/45">
        <span>{labels[1]}</span>
        <span className="font-semibold text-[#84FF00]">{labels[value] ?? ""}</span>
        <span>{labels[5]}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function CheckInForm({
  enrollmentId,
  weekNumber,
  onSuccess,
  onClose,
}: CheckInFormProps) {
  const [morningWeight1, setMorningWeight1] = useState("");
  const [morningWeight2, setMorningWeight2] = useState("");
  const [morningWeight3, setMorningWeight3] = useState("");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [hungerLevel, setHungerLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [adherencePercent, setAdherencePercent] = useState(90);
  const [clientNote, setClientNote] = useState("");
  const [noteCategory, setNoteCategory] = useState<NoteCategory>(3);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CheckInSubmitResponse | null>(null);

  const noteLength = clientNote.length;

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const w1 = Number(morningWeight1);
    if (!morningWeight1.trim()) {
      errors.morningWeight1 = "Required.";
    } else if (Number.isNaN(w1) || w1 < MIN_WEIGHT_KG || w1 > MAX_WEIGHT_KG) {
      errors.morningWeight1 = `Enter a weight between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.`;
    }

    if (morningWeight2.trim()) {
      const w2 = Number(morningWeight2);
      if (Number.isNaN(w2) || w2 < MIN_WEIGHT_KG || w2 > MAX_WEIGHT_KG) {
        errors.morningWeight2 = `Enter a weight between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.`;
      }
    }

    if (morningWeight3.trim()) {
      const w3 = Number(morningWeight3);
      if (Number.isNaN(w3) || w3 < MIN_WEIGHT_KG || w3 > MAX_WEIGHT_KG) {
        errors.morningWeight3 = `Enter a weight between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.`;
      }
    }

    if (clientNote.length > MAX_NOTE_LENGTH) {
      errors.clientNote = `Note must be ${MAX_NOTE_LENGTH} characters or fewer.`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    const payload: CheckInPayload = {
      morningWeight1: Number(morningWeight1),
      energyLevel,
      hungerLevel,
      sleepQuality,
      adherencePercent,
    };

    if (morningWeight2.trim()) payload.morningWeight2 = Number(morningWeight2);
    if (morningWeight3.trim()) payload.morningWeight3 = Number(morningWeight3);

    const trimmedNote = clientNote.trim();
    if (trimmedNote) {
      payload.clientNote = trimmedNote;
      payload.noteCategory = noteCategory;
    }

    setIsSubmitting(true);
    try {
      const data = await submitCheckIn(enrollmentId, payload);
      setResult(data);
      onSuccess(data);
    } catch (err: any) {
      // apiClient is axios-based, so failures land here as AxiosError —
      // the server's JSON body (status, message) is on err.response.data.
      // The API currently returns HTTP 500 (instead of 409/400) when a
      // check-in for this week already exists, so we match on the message
      // text rather than the status code to show a friendly notice.
      const status = err?.response?.status;
      const message: string | undefined = err?.response?.data?.message;

      if (status === 500 && message && /already been submitted/i.test(message)) {
        setSubmitError("You have already submitted this week's check-in.");
      } else if (message) {
        setSubmitError(message);
      } else if (err?.request) {
        setSubmitError("Couldn't reach the server. Check your connection and try again.");
      } else {
        setSubmitError("Something went wrong submitting your check-in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) onClose();
  }

  /* ---------------------------------------------------------------- */
  /*  Success state                                                    */
  /* ---------------------------------------------------------------- */

  if (result) {
    return (
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogContent className="border-white/10 bg-[#0a0a0a] text-white sm:max-w-md">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#84FF00]/35 bg-[#84FF00]/10 text-2xl text-[#84FF00]">
              ✓
            </div>
            <h2 className="mb-3 text-xl font-black uppercase tracking-tight text-white">
              Check-in submitted
            </h2>
            <p className="mb-1 text-[15px] text-white/85">
              Average weight:{" "}
              <strong className="text-[#84FF00]">{result.averageWeight.toFixed(1)} kg</strong>
            </p>
            <p className="mb-7 text-[13.5px] text-white/50">
              {result.coachReviewPending
                ? "Your coach will review within 48 hours and unlock your next week."
                : result.message}
            </p>
            <Button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl bg-white px-6 text-[#050505] hover:bg-[#84FF00]"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Form state                                                        */
  /* ---------------------------------------------------------------- */

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0a0a0a] text-white sm:max-w-lg">
        <DialogHeader>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#84FF00]">
            Week {weekNumber}
          </p>
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-white">
            Weekly Check-In
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <div className="rounded-xl border border-[#FF6B00]/35 bg-[#FF6B00]/10 px-4 py-3 text-sm text-[#FF6B00]">
              {submitError}
            </div>
          )}

          <div className="border-b border-white/10 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-white/45">
            Morning weights (kg)
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75" htmlFor="weight1">
                Monday Morning Weight (kg) *
              </label>
              <Input
                id="weight1"
                type="number"
                inputMode="decimal"
                step="0.1"
                className={cn(
                  "border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus-visible:ring-[#84FF00]",
                  fieldErrors.morningWeight1 && "border-[#FF6B00]"
                )}
                value={morningWeight1}
                onChange={(e) => setMorningWeight1(e.target.value)}
                placeholder="78.4"
              />
              {fieldErrors.morningWeight1 && (
                <span className="text-xs text-[#FF6B00]">{fieldErrors.morningWeight1}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75" htmlFor="weight2">
                Tuesday Morning Weight (kg)
              </label>
              <Input
                id="weight2"
                type="number"
                inputMode="decimal"
                step="0.1"
                className={cn(
                  "border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus-visible:ring-[#84FF00]",
                  fieldErrors.morningWeight2 && "border-[#FF6B00]"
                )}
                value={morningWeight2}
                onChange={(e) => setMorningWeight2(e.target.value)}
                placeholder="Optional"
              />
              {fieldErrors.morningWeight2 && (
                <span className="text-xs text-[#FF6B00]">{fieldErrors.morningWeight2}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75" htmlFor="weight3">
                Wednesday Morning Weight (kg)
              </label>
              <Input
                id="weight3"
                type="number"
                inputMode="decimal"
                step="0.1"
                className={cn(
                  "border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus-visible:ring-[#84FF00]",
                  fieldErrors.morningWeight3 && "border-[#FF6B00]"
                )}
                value={morningWeight3}
                onChange={(e) => setMorningWeight3(e.target.value)}
                placeholder="Optional"
              />
              {fieldErrors.morningWeight3 && (
                <span className="text-xs text-[#FF6B00]">{fieldErrors.morningWeight3}</span>
              )}
            </div>
          </div>

          <div className="border-b border-white/10 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-white/45">
            How are you feeling?
          </div>

          <ScaleSelector
            label="Energy Level"
            labels={ENERGY_LABELS}
            value={energyLevel}
            onChange={setEnergyLevel}
          />
          <ScaleSelector
            label="Hunger Level"
            labels={HUNGER_LABELS}
            value={hungerLevel}
            onChange={setHungerLevel}
          />
          <ScaleSelector
            label="Sleep Quality"
            labels={SLEEP_LABELS}
            value={sleepQuality}
            onChange={setSleepQuality}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/75" htmlFor="adherence">
              How well did you follow the plan this week?
            </label>
            <div className="flex items-center gap-4">
              <Slider
                id="adherence"
                min={0}
                max={100}
                step={1}
                value={[adherencePercent]}
                onValueChange={([v]) => setAdherencePercent(v)}
                className="flex-1 [&_[role=slider]]:border-[#84FF00] [&_[role=slider]]:bg-[#84FF00] [&_.bg-primary]:bg-[#84FF00]"
              />
              <span className="min-w-[48px] text-right text-base font-extrabold text-[#84FF00]">
                {adherencePercent}%
              </span>
            </div>
          </div>

          <div className="border-b border-white/10 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-white/45">
            Note for your coach (optional)
          </div>

          <div className="space-y-1.5">
            <Textarea
              className={cn(
                "min-h-[70px] resize-y border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus-visible:ring-[#84FF00]",
                fieldErrors.clientNote && "border-[#FF6B00]"
              )}
              value={clientNote}
              maxLength={MAX_NOTE_LENGTH}
              onChange={(e) => setClientNote(e.target.value)}
              placeholder="Health issues, life events, or feedback on the plan…"
              rows={3}
            />
            <div className="flex justify-end">
              {fieldErrors.clientNote ? (
                <span className="text-xs text-[#FF6B00]">{fieldErrors.clientNote}</span>
              ) : (
                <span className="text-xs text-white/45">
                  {noteLength}/{MAX_NOTE_LENGTH}
                </span>
              )}
            </div>
          </div>

          {clientNote.trim().length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75" htmlFor="noteCategory">
                Note Category
              </label>
              <Select
                value={String(noteCategory)}
                onValueChange={(v) => setNoteCategory(Number(v) as NoteCategory)}
              >
                <SelectTrigger
                  id="noteCategory"
                  className="border-white/10 bg-white/[0.03] text-white focus:ring-[#84FF00]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0a0a0a] text-white">
                  {NOTE_CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-[12.5px] text-white/50">
            Your coach will review within 48 hours and unlock your next week.
          </p>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 rounded-xl border-[#84FF00] text-[#84FF00] hover:bg-[#84FF00]/10 hover:text-[#84FF00]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-xl bg-white px-6 text-[#050505] hover:bg-[#84FF00] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit Check-In"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}