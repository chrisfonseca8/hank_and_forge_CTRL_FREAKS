// src/components/StatsBar.jsx
// Displays interview stage (not raw difficulty number), question type,
// and running average — aligned with enterprise recruitment language.

// Maps numeric difficulty (1–10) to a stage label visible to the candidate.
const STAGE_MAP = [
  { max: 2,  label: "Introductory",   color: "var(--green)" },
  { max: 4,  label: "Foundational",   color: "var(--green)" },
  { max: 6,  label: "Intermediate",   color: "var(--accent)" },
  { max: 8,  label: "Advanced",       color: "var(--yellow)" },
  { max: 10, label: "Expert",         color: "var(--red)" },
];

const getStage = (difficulty) => {
  const d = difficulty ?? 5;
  return STAGE_MAP.find((s) => d <= s.max) ?? STAGE_MAP[STAGE_MAP.length - 1];
};

export default function StatsBar({ difficulty, questionType, average, questionNum }) {
  const stage      = getStage(difficulty);
  const avgDisplay = average != null ? `${Math.round(average * 100)}%` : "—";
  const diffPct    = `${((difficulty ?? 5) / 10) * 100}%`;

  return (
    <>
      {/* ── Stat pills ──────────────────────────────────── */}
      <div className="stats-bar">

        {/* Interview stage — visible language instead of raw number */}
        <div className="stat-pill difficulty">
          <span className="dot" />
          <span>
            Stage:&nbsp;<strong style={{ color: stage.color }}>{stage.label}</strong>
          </span>
        </div>

        {/* Main vs Follow-up */}
        <div className="stat-pill type">
          <span className="dot" />
          <span>{questionType}</span>
        </div>

        {/* Running average */}
        <div className="stat-pill score">
          <span className="dot" />
          <span>Performance Avg:&nbsp;<strong>{avgDisplay}</strong></span>
        </div>

        {/* Question counter — shown once we know the number */}
        {questionNum != null && (
          <div className="stat-pill">
            <span className="dot" />
            <span>Q&nbsp;<strong>{questionNum}</strong></span>
          </div>
        )}

      </div>

      {/* ── Complexity bar ──────────────────────────────── */}
      <div className="diff-bar-wrap">
        <span className="diff-label">Introductory</span>
        <div className="diff-bar">
          <div className="diff-fill" style={{ width: diffPct }} />
        </div>
        <span className="diff-label">Expert</span>
      </div>
    </>
  );
}