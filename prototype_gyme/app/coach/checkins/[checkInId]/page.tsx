"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getCoachCheckInDetails,
  submitCoachCheckInDecision,
} from "@/services/coach-checkin";
import type { CoachCheckInDecisionType, CoachCheckInDetails } from "@/types/coach-checkin";

export default function CoachCheckInDetailsPage() {
  const params = useParams<{ checkInId: string }>();
  const checkInId = Number(params.checkInId);

  const [details, setDetails] = useState<CoachCheckInDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<CoachCheckInDecisionType>("Approve");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const res = await getCoachCheckInDetails(checkInId);
        if (!alive) return;
        setDetails(res);
      } catch (err) {
        if (!alive) return;
        setMessage(err instanceof Error ? err.message : "Failed to load check-in.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (!Number.isNaN(checkInId)) load();
    return () => {
      alive = false;
    };
  }, [checkInId]);

  async function handleSubmit() {
    try {
      setSaving(true);
      const res = await submitCoachCheckInDecision(checkInId, {
        decision,
        feedbackNote: feedbackNote.trim() || undefined,
      });
      setMessage(res.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to submit decision.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="coach-page"><div className="coach-panel">Loading check-in...</div></div>;
  }

  return (
    <div className="coach-page">
      <section className="coach-hero">
        <div>
          <p className="coach-kicker">Coach Check-In</p>
          <h2>Review Details</h2>
        </div>
        <Link className="coach-button coach-button-secondary" href="/coach/checkins">
          Back to Queue
        </Link>
      </section>

      {message ? <div className="coach-banner">{message}</div> : null}

      {details ? (
        <div className="coach-panel">
          <div className="coach-review-grid">
            <div className="coach-review-card">
              <h4>Measurements</h4>
              <ul>
                <li>Trainee: {details.traineeName}</li>
                <li>Average Weight: {details.averageWeight ?? "-"}</li>
                <li>Weight Delta: {details.weightDeltaKg ?? "-"}</li>
                <li>Energy Level: {details.energyLevel ?? "-"}</li>
                <li>Hunger Level: {details.hungerLevel ?? "-"}</li>
                <li>Sleep Quality: {details.sleepQuality ?? "-"}</li>
              </ul>
            </div>

            <div className="coach-review-card">
              <h4>Proposal</h4>
              <ul>
                <li>Expected Range: {details.expectedMin ?? "-"} → {details.expectedMax ?? "-"}</li>
                <li>Proposal Kcal: {details.systemProposalKcal ?? "-"}</li>
                <li>Confidence: {details.systemConfidence ?? "-"}</li>
                <li>Reasoning: {details.systemProposalReasoning ?? "-"}</li>
                <li>Projected Outcome: {details.projectedOutcomeIfNoAction ?? "-"}</li>
              </ul>
            </div>
          </div>

          <div className="coach-review-card">
            <h4>Client Note</h4>
            <p className="coach-prewrap">{details.clientNote ?? "No note provided."}</p>
          </div>

          <div className="coach-review-card">
            <h4>Weight History</h4>
            <div className="coach-list">
              {details.weightHistory.map((item) => (
                <div className="coach-list-item" key={item.weekNumber}>
                  <div>
                    <strong>Week {item.weekNumber}</strong>
                    <p>Weight: {item.averageWeight ?? "-"} · Calories: {item.caloriesApplied ?? "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="coach-review-card">
            <h4>Decision</h4>
            <textarea
              className="coach-input coach-textarea"
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="Feedback..."
            />
            <div className="coach-inline-actions">
              <button className="coach-button coach-button-secondary" onClick={() => setDecision("Approve")}>
                Approve
              </button>
              <button className="coach-button coach-button-danger" onClick={() => setDecision("Reject")}>
                Reject
              </button>
            </div>
            <button className="coach-button coach-button-wide" onClick={handleSubmit} disabled={saving}>
              {saving ? "Submitting..." : `Submit ${decision}`}
            </button>
          </div>
        </div>
      ) : (
        <div className="coach-empty">No check-in found.</div>
      )}
    </div>
  );
}
