// src/components/InterviewPage.jsx

import { useState, useCallback, useRef } from "react";
import StatsBar      from "./StatsBar";
import QuestionCard  from "./QuestionCard";
import AnswerBox     from "./AnswerBox";
import FeedbackStrip from "./FeedbackStrip";
import { submitAnswer } from "../services/api";

const SESSION_KEY = "interviewSessionId";

export default function InterviewPage({
  question,
  sessionId,
  onEnd,
  onError,
  onExhausted,
}) {
  const [currentQ,      setCurrentQ]     = useState(question);
  const [feedback,      setFeedback]     = useState(null);
  const [pendingNextQ,  setPendingNextQ] = useState(null);
  const [answer,        setAnswer]       = useState("");
  const [loading,       setLoading]      = useState(false);
  const [animKey,       setAnimKey]      = useState(0);
  const [questionNum,   setQuestionNum]  = useState(1);  // visible counter

  // Running stats for the final report
  const totalAnswered = useRef(0);
  const lastAverage   = useRef(null);

  const questionType = currentQ.isFollowup
    ? `Follow-up ${(currentQ.followupIndex ?? 0) + 1} of 5`
    : "Main Question";

  // ── Submit answer ────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const trimmed = answer.trim();
    if (!trimmed) return onError("Please write an answer before submitting.");

    const sid = sessionId || localStorage.getItem(SESSION_KEY);
    if (!sid) return onError("No active session. Please refresh.");

    setLoading(true);
    setFeedback(null);
    setPendingNextQ(null);

    try {
      const data = await submitAnswer(sid, trimmed);

      // Track running stats for the end report
      totalAnswered.current += 1;
      if (data.average != null) lastAverage.current = data.average;

      setFeedback({
        score:      data.score,
        average:    data.average,
        difficulty: data.difficulty,
        review:     data.reviewText ?? null,
        exhausted:  data.exhausted ?? false,
      });

      setPendingNextQ(data);

    } catch (err) {
      if (err.response?.status === 404) {
        localStorage.removeItem(SESSION_KEY);
        onError("Session expired. Please start a new interview.");
        setTimeout(() => onEnd(), 1500);
        return;
      }
      onError(err.response?.data?.error ?? err.message ?? "Submission failed.");
    } finally {
      setLoading(false);
    }
  }, [answer, sessionId, onEnd, onError]);

  // ── User clicks "Next Question" ──────────────────────────
  const handleNext = useCallback(() => {
    if (!pendingNextQ) return;

    if (pendingNextQ.exhausted) {
      onExhausted({
        message:          pendingNextQ.message,
        average:          lastAverage.current,
        questionsAnswered: totalAnswered.current,
      });
      return;
    }

    // Only increment the visible counter on main questions, not followups
    if (!pendingNextQ.isFollowup) {
      setQuestionNum(n => n + 1);
    }

    setCurrentQ(pendingNextQ);
    setAnswer("");
    setFeedback(null);
    setPendingNextQ(null);
    setAnimKey(k => k + 1);
  }, [pendingNextQ, onExhausted]);

  // ── End early ────────────────────────────────────────────
  const handleEnd = () => {
    if (window.confirm("End the interview early? Your progress will be lost.")) {
      localStorage.removeItem(SESSION_KEY);
      onEnd("Interview ended early.");
    }
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <main className="page interview-page">
      <div className="interview-wrap">

        <StatsBar
          difficulty={currentQ.difficulty}
          questionType={questionType}
          average={feedback?.average ?? currentQ.average}
          questionNum={questionNum}
        />

        <QuestionCard
          key={animKey}
          animKey={animKey}
          questionText={currentQ.questionText}
          topic={currentQ.topic}
          isFollowup={currentQ.isFollowup}
          followupIndex={currentQ.followupIndex}
          difficulty={currentQ.difficulty}
        />

        {feedback && (
          <FeedbackStrip
            score={feedback.score}
            average={feedback.average}
            difficulty={feedback.difficulty}
            review={feedback.review}
            exhausted={feedback.exhausted}
            onNext={handleNext}
          />
        )}

        {/* Answer box only visible when not showing feedback */}
        {!feedback && (
          <AnswerBox
            answer={answer}
            onChange={setAnswer}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}

        <div className="btn-end-row">
          <button className="btn-end" onClick={handleEnd}>
            Withdraw from Interview
          </button>
        </div>

      </div>
    </main>
  );
}