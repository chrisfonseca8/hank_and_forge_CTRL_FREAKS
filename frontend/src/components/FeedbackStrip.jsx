// src/components/FeedbackStrip.jsx
// Post-answer evaluation panel aligned with PS2 assessment criteria:
// correctness, relevance, clarity, and depth — surfaced as a rating
// label alongside the aggregate score and the ML model's review text.

// Performance rating labels (thresholds match scoring.js)
const getRating = (score) => {
  if (score >= 0.80) return { label: "Excellent",          color: "var(--green)"  };
  if (score >= 0.65) return { label: "Proficient",         color: "var(--green)"  };
  if (score >= 0.50) return { label: "Satisfactory",       color: "var(--yellow)" };
  if (score >= 0.40) return { label: "Developing",         color: "var(--yellow)" };
  return               { label: "Needs Improvement",      color: "var(--red)"    };
};

export default function FeedbackStrip({
  score,
  average,
  difficulty,
  review,
  exhausted = false,
  onNext,
}) {
  if (score == null) return null;

  const pct    = Math.round(score * 100);
  const avgPct = Math.round((average ?? score) * 100);
  const rating = getRating(score);

  // Strip colour still follows the three-band system
  let variant = "low";
  if (score >= 0.65)     variant = "good";
  else if (score >= 0.4) variant = "mid";

  return (
    <div className={`feedback-strip ${variant}`}>

      {/* ── Left: score + rating badge ──────────────────── */}
      <div className="feedback-left">
        <span className="feedback-score">{pct}%</span>
        <span className="feedback-rating" style={{ color: rating.color }}>
          {rating.label}
        </span>
      </div>

      {/* ── Right: stats + review + action ──────────────── */}
      <div className="feedback-body">

        {/* Metric row */}
        <div className="feedback-detail">
          <strong>This answer:</strong>&nbsp;{pct}%
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <strong>Session avg:</strong>&nbsp;{avgPct}%
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <strong>Stage:</strong>&nbsp;{difficulty}/10
        </div>

        {/* AI evaluation review */}
        {review && review.trim() !== "" && (
          <p className="feedback-review">
            <strong>Evaluator Feedback:&nbsp;</strong>
            {review}
          </p>
        )}

        {/* Action */}
        <div className="feedback-actions">
          <button className="btn-next" onClick={onNext}>
            {exhausted ? "View Assessment Report →" : "Next Question →"}
          </button>
        </div>

      </div>
    </div>
  );
}