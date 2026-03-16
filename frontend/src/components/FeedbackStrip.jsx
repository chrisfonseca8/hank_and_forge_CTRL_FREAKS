// src/components/FeedbackStrip.jsx
// Post-answer evaluation panel. Receives isSpeaking from InterviewPage
// and shows an animated speaking indicator while the TTS voice is active.

const getRating = (score) => {
  if (score >= 0.80) return { label: "Excellent",        color: "var(--green)"  };
  if (score >= 0.65) return { label: "Proficient",       color: "var(--green)"  };
  if (score >= 0.50) return { label: "Satisfactory",     color: "var(--yellow)" };
  if (score >= 0.40) return { label: "Developing",       color: "var(--yellow)" };
  return               { label: "Needs Improvement",    color: "var(--red)"    };
};

export default function FeedbackStrip({
  score,
  average,
  difficulty,
  review,
  exhausted     = false,
  onNext,
  summaryLoading = false,
  isSpeaking     = false,
}) {
  if (score == null) return null;

  const pct    = Math.round(score * 100);
  const avgPct = Math.round((average ?? score) * 100);
  const rating = getRating(score);

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

      {/* ── Right: stats + speaking indicator + review + action */}
      <div className="feedback-body">

        {/* Metric row */}
        <div className="feedback-detail">
          <strong>This answer:</strong>&nbsp;{pct}%
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <strong>Session avg:</strong>&nbsp;{avgPct}%
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <strong>Stage:</strong>&nbsp;{difficulty}/10
        </div>

        {/* ── Speaking indicator — only visible while TTS is active ── */}
        {isSpeaking && (
          <div className="speaking-indicator">
            {/* Three animated bars that pulse like a waveform */}
            <span className="speaking-bar" />
            <span className="speaking-bar" />
            <span className="speaking-bar" />
            <span className="speaking-bar" />
            <span className="speaking-bar" />
            <span className="speaking-label">AI Interviewer Speaking…</span>
          </div>
        )}

        {/* AI evaluation review text */}
        {review && review.trim() !== "" && (
          <p className="feedback-review">
            <strong>Evaluator Feedback:&nbsp;</strong>
            {review}
          </p>
        )}

        {/* Action button */}
        <div className="feedback-actions">
          <button
            className="btn-next"
            onClick={onNext}
            disabled={summaryLoading}
          >
            {summaryLoading ? (
              <><span className="spinner spinner--sm" />&nbsp;Generating report…</>
            ) : exhausted ? (
              "View Assessment Report →"
            ) : (
              "Next Question →"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}