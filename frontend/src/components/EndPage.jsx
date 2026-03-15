// src/components/EndPage.jsx
// Enterprise assessment report — shown after all questions are answered
// or after the candidate withdraws early.

// Suitability rating derived from final average score
const getSuitability = (avg) => {
  if (avg == null) return null;
  if (avg >= 0.75) return { label: "Strong Candidate",    grade: "A", color: "var(--green)",  desc: "Demonstrates exceptional depth and clarity across topics." };
  if (avg >= 0.60) return { label: "Good Candidate",      grade: "B", color: "var(--accent)", desc: "Shows solid understanding with room for targeted improvement." };
  if (avg >= 0.45) return { label: "Average Candidate",   grade: "C", color: "var(--yellow)", desc: "Foundational knowledge present; further development recommended." };
  return               { label: "Needs Development",    grade: "D", color: "var(--red)",    desc: "Significant gaps identified. Does not meet the current role threshold." };
};

export default function EndPage({ candidateName, role, report, onRestart }) {
  const { average, questionsAnswered, early } = report ?? {};
  const suitability = getSuitability(average);
  const avgPct      = average != null ? Math.round(average * 100) : null;

  return (
    <main className="page page-end">
      <div className="report-card">

        {/* ── Header ──────────────────────────────────── */}
        <div className="report-header">
          <div className="report-status-icon">
            {early ? "⊘" : "◈"}
          </div>
          <div>
            <h2 className="report-title">
              {early ? "Assessment Withdrawn" : "Assessment Complete"}
            </h2>
            <p className="report-subtitle">
              {early
                ? "The interview was ended before completion."
                : "All interview stages have been completed."}
            </p>
          </div>
        </div>

        {/* ── Candidate details ────────────────────────── */}
        <div className="report-meta">
          <div className="report-meta-item">
            <span className="report-meta-label">Candidate</span>
            <span className="report-meta-value">{candidateName || "—"}</span>
          </div>
          <div className="report-meta-item">
            <span className="report-meta-label">Position</span>
            <span className="report-meta-value">{role || "—"}</span>
          </div>
          {questionsAnswered != null && (
            <div className="report-meta-item">
              <span className="report-meta-label">Questions Answered</span>
              <span className="report-meta-value">{questionsAnswered}</span>
            </div>
          )}
          {avgPct != null && (
            <div className="report-meta-item">
              <span className="report-meta-label">Overall Score</span>
              <span className="report-meta-value" style={{ color: suitability?.color }}>
                {avgPct}%
              </span>
            </div>
          )}
        </div>

        {/* ── Suitability verdict ──────────────────────── */}
        {suitability && !early && (
          <div className="report-verdict" style={{ borderColor: suitability.color }}>
            <div className="verdict-grade" style={{ color: suitability.color }}>
              {suitability.grade}
            </div>
            <div className="verdict-body">
              <p className="verdict-label" style={{ color: suitability.color }}>
                {suitability.label}
              </p>
              <p className="verdict-desc">{suitability.desc}</p>
            </div>
          </div>
        )}

        {/* ── Score bar ────────────────────────────────── */}
        {avgPct != null && !early && (
          <div className="report-score-bar-wrap">
            <div className="report-score-bar">
              <div
                className="report-score-fill"
                style={{
                  width: `${avgPct}%`,
                  background: suitability?.color ?? "var(--accent)",
                }}
              />
            </div>
            <span className="report-score-label">{avgPct}% overall performance</span>
          </div>
        )}

        {/* ── Actions ──────────────────────────────────── */}
        <div className="report-actions">
          <button className="btn-restart" onClick={onRestart}>
            Start New Assessment
          </button>
        </div>

      </div>
    </main>
  );
}