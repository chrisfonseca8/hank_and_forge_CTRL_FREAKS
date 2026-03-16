// src/components/TabWarningModal.jsx
// Blocking overlay modal shown when the candidate switches tabs.
// On the first violation, the candidate can acknowledge and continue.
// On the second (final) violation, the button ends the interview.

export default function TabWarningModal({
  violations,
  maxViolations,
  onAcknowledge,
}) {
  const isFinal = violations >= maxViolations;

  return (
    // Full-screen backdrop — pointer-events block all interaction behind it
    <div className="tab-warning-backdrop">
      <div className={`tab-warning-modal ${isFinal ? "tab-warning-modal--final" : ""}`}>

        {/* ── Icon ─────────────────────────────────────── */}
        <div className="tab-warning-icon">
          {isFinal ? "⊘" : "⚠"}
        </div>

        {/* ── Violation counter ─────────────────────────── */}
        <div className="tab-warning-counter">
          {Array.from({ length: maxViolations }).map((_, i) => (
            <span
              key={i}
              className={`tab-warning-dot ${i < violations ? "tab-warning-dot--active" : ""}`}
            />
          ))}
        </div>

        {/* ── Heading ──────────────────────────────────── */}
        <h2 className="tab-warning-title">
          {isFinal ? "Interview Terminated" : `Tab Switch Detected — Warning ${violations} of ${maxViolations}`}
        </h2>

        {/* ── Body text ────────────────────────────────── */}
        <p className="tab-warning-body">
          {isFinal
            ? "You have switched tabs or left the interview window more than once. The interview has been ended due to a violation of assessment rules. Your progress will be submitted."
            : `You switched away from the interview tab. This is warning ${violations} of ${maxViolations}. A second tab switch will immediately end the interview and submit your results.`
          }
        </p>

        {/* ── Action button ─────────────────────────────── */}
        <button
          className={`tab-warning-btn ${isFinal ? "tab-warning-btn--end" : "tab-warning-btn--warn"}`}
          onClick={onAcknowledge}
        >
          {isFinal ? "Submit & View Report" : "I Understand — Resume Interview"}
        </button>

      </div>
    </div>
  );
}