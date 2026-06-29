"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getCoachQueue } from "@/services/coach-checkin";
import type { CoachCheckInQueueItem } from "@/types/coach-checkin";

// Re-export type alias for local use
type QueueItem = CoachCheckInQueueItem;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getPriorityMeta(priority: number) {
  if (priority === 1)
    return { label: "Urgent", color: "#FF6B00", bg: "rgba(255,107,0,0.12)" };
  if (priority === 2)
    return { label: "On Track", color: "#84FF00", bg: "rgba(132,255,0,0.10)" };
  return {
    label: "No Check-In",
    color: "rgba(255,255,255,0.35)",
    bg: "rgba(255,255,255,0.05)",
  };
}

function getConfidenceMeta(c: string | null) {
  if (c === "High") return { color: "#84FF00" };
  if (c === "Low") return { color: "#FF6B00" };
  if (c === "Medium") return { color: "#00D9FF" };
  return { color: "rgba(255,255,255,0.30)" };
}

function AdherenceBar({ value }: { value: number | null }) {
  if (value === null)
    return <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>—</span>;
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 80 ? "#84FF00" : pct >= 50 ? "#FF6B00" : "#ff4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          flex: 1,
          height: 4,
          borderRadius: 99,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 99,
            transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
      <span style={{ color, fontSize: 13, fontWeight: 700, minWidth: 36 }}>
        {pct}%
      </span>
    </div>
  );
}

function WeekProgress({
  week,
  total,
}: {
  week: number;
  total: number;
}) {
  const pct = total > 0 ? (week / total) * 100 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "rgba(255,255,255,0.40)",
        }}
      >
        <span>WEEK</span>
        <span>
          {week} / {total}
        </span>
      </div>
      <div
        style={{
          height: 3,
          borderRadius: 99,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg, #84FF00, rgba(132,255,0,0.5))",
            borderRadius: 99,
          }}
        />
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function QueueCard({ item, index }: { item: QueueItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 80);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const priority = getPriorityMeta(item.priority);
  const confidence = getConfidenceMeta(item.systemConfidence);
  const hasCheckIn = item.checkInId !== 0;

  return (
    <div
      ref={cardRef}
      style={{
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 20,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left accent stripe */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "20%",
          bottom: "20%",
          width: 3,
          borderRadius: "0 3px 3px 0",
          background: priority.color,
          opacity: 0.8,
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: "#fff",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.traineeName}
            </span>
            {item.hasClientNote && (
              <span
                title={item.noteCategory ?? "Note"}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: "rgba(0,217,255,0.12)",
                  color: "#00D9FF",
                  border: "1px solid rgba(0,217,255,0.25)",
                  flexShrink: 0,
                }}
              >
                {item.noteCategory ?? "Note"}
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.50)",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.planName}
          </p>
        </div>

        {/* Priority pill */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            padding: "4px 10px",
            borderRadius: 99,
            background: priority.bg,
            color: priority.color,
            border: `1px solid ${priority.color}30`,
            flexShrink: 0,
          }}
        >
          {priority.label}
        </span>
      </div>

      {/* Week progress */}
      <WeekProgress week={item.weekNumber} total={item.totalWeeks} />

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {/* Avg Weight */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            padding: "10px 12px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
          >
            Avg Weight
          </div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#84FF00" }}>
            {item.averageWeight != null ? `${item.averageWeight}` : "—"}
            {item.averageWeight != null && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.40)",
                  marginLeft: 2,
                }}
              >
                kg
              </span>
            )}
          </div>
          {item.weightDeltaKg != null && (
            <div
              style={{
                fontSize: 11,
                color:
                  item.weightDeltaKg > 0
                    ? "#FF6B00"
                    : item.weightDeltaKg < 0
                    ? "#84FF00"
                    : "rgba(255,255,255,0.35)",
                marginTop: 2,
              }}
            >
              {item.weightDeltaKg > 0 ? "+" : ""}
              {item.weightDeltaKg} kg
            </div>
          )}
        </div>

        {/* Adherence */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            padding: "10px 12px",
            border: "1px solid rgba(255,255,255,0.06)",
            gridColumn: "span 2",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Adherence
          </div>
          <AdherenceBar value={item.adherencePercent} />
        </div>
      </div>

      {/* Bottom row: confidence + actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingTop: 4,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Confidence */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: confidence.color,
              boxShadow: `0 0 6px ${confidence.color}`,
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.40)",
            }}
          >
            {item.systemConfidence
              ? `${item.systemConfidence} Confidence`
              : "No Data"}
          </span>
          {item.proposedAdjustmentKcal !== null &&
            item.proposedAdjustmentKcal !== 0 && (
              <span
                style={{
                  fontSize: 11,
                  color: "#FF6B00",
                  marginLeft: 4,
                }}
              >
                {item.proposedAdjustmentKcal > 0 ? "+" : ""}
                {item.proposedAdjustmentKcal} kcal suggested
              </span>
            )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          {hasCheckIn && (
            <Link
              href={`/coach/checkins/${item.checkInId}`}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.55)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                padding: "6px 12px",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#fff";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.10)";
              }}
            >
              View Check-In
            </Link>
          )}

          {/* ← THE NEW CONSTRAINTS EDIT BUTTON */}
          <Link
            href={`/coach/constraints/${item.enrollmentId}`}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#050505",
              background: "#84FF00",
              border: "1px solid #84FF00",
              borderRadius: 8,
              padding: "6px 14px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "all 0.2s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#a0ff33";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 16px rgba(132,255,0,0.40)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#84FF00";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Constraints
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoachCheckInsPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCoachQueue();
        if (alive) setQueue(data);
      } catch (err) {
        if (alive)
          setError(err instanceof Error ? err.message : "Failed to load queue.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const urgent = queue.filter((q) => q.priority === 1);
  const onTrack = queue.filter((q) => q.priority === 2);
  const noCheckIn = queue.filter((q) => q.priority === 3);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          padding: "80px 24px 60px",
          overflow: "hidden",
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 300,
            background: "radial-gradient(ellipse, rgba(132,255,0,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Animated grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(132,255,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(132,255,0,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#84FF00",
                  marginBottom: 10,
                }}
              >
                Coach Module / Check-Ins
              </p>
              <h1
                style={{
                  fontSize: "clamp(28px, 5vw, 48px)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  margin: "0 0 10px",
                  lineHeight: 1.05,
                }}
              >
                Review{" "}
                <span style={{ color: "#84FF00" }}>Queue</span>
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.50)",
                  margin: 0,
                  maxWidth: 460,
                }}
              >
                Weekly check-ins sorted by priority. Edit constraints directly
                from each client card.
              </p>
            </div>

            {/* Summary chips */}
            {!loading && !error && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { label: "Total", value: queue.length, color: "#fff" },
                  { label: "On Track", value: onTrack.length, color: "#84FF00" },
                  { label: "Urgent", value: urgent.length, color: "#FF6B00" },
                  {
                    label: "No Check-In",
                    value: noCheckIn.length,
                    color: "rgba(255,255,255,0.40)",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 14,
                      padding: "10px 18px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: s.color,
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginTop: 3,
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "rgba(255,255,255,0.35)",
              fontSize: 15,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: "2px solid rgba(132,255,0,0.20)",
                borderTop: "2px solid #84FF00",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            Loading queue...
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(255,68,68,0.08)",
              border: "1px solid rgba(255,68,68,0.20)",
              borderRadius: 16,
              padding: "20px 24px",
              color: "#ff6666",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Urgent */}
            {urgent.length > 0 && (
              <QueueSection
                title="Urgent"
                accent="#FF6B00"
                items={urgent}
                startIndex={0}
              />
            )}

            {/* On Track */}
            {onTrack.length > 0 && (
              <QueueSection
                title="On Track"
                accent="#84FF00"
                items={onTrack}
                startIndex={urgent.length}
              />
            )}

            {/* No Check-In */}
            {noCheckIn.length > 0 && (
              <QueueSection
                title="No Check-In Submitted"
                accent="rgba(255,255,255,0.25)"
                items={noCheckIn}
                startIndex={urgent.length + onTrack.length}
              />
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function QueueSection({
  title,
  accent,
  items,
  startIndex,
}: {
  title: string;
  accent: string;
  items: QueueItem[];
  startIndex: number;
}) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 4,
            height: 18,
            borderRadius: 99,
            background: accent,
          }}
        />
        <h2
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.10em",
            color: accent,
            margin: 0,
          }}
        >
          {title}
        </h2>
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 99,
            padding: "2px 9px",
          }}
        >
          {items.length}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 16,
        }}
      >
        {items.map((item, i) => (
          <QueueCard key={item.enrollmentId} item={item} index={startIndex + i} />
        ))}
      </div>
    </div>
  );
}