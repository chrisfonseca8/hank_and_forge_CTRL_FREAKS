// src/components/QuestionCard.jsx
// Re-mounts (via key) on every new question to replay the fadeUp animation.

export default function QuestionCard({ questionText, topic, isFollowup, followupIndex, animKey }) {
  const typeLabel = isFollowup
    ? `Follow-up ${(followupIndex ?? 0) + 1}/5`
    : "Main Question";

  const typeClass = isFollowup ? "tag tag-followup" : "tag tag-main";

  return (
    <div className="question-card" key={animKey}>
      <div className="question-meta">
        <span className="tag tag-topic">{topic ?? "—"}</span>
        <span className={typeClass}>{typeLabel}</span>
      </div>
      <p className="question-text">{questionText}</p>
    </div>
  );
}