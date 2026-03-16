// src/components/InterviewPage.jsx

import { useState, useCallback, useRef, useEffect } from "react";
import StatsBar         from "./StatsBar";
import QuestionCard     from "./QuestionCard";
import AnswerBox        from "./AnswerBox";
import FeedbackStrip    from "./FeedbackStrip";
import TabWarningModal  from "./TabWarningModal";
import { submitAnswer, endSession } from "../services/api";
import { speak, stopSpeech, isSpeechSupported } from "../../../backend/utils/speech";
import { useTabWarning } from "../hooks/useTabWarning";

const SESSION_KEY = "interviewSessionId";

export default function InterviewPage({
  question,
  sessionId,
  onEnd,
  onError,
  onExhausted,
}) {
  const [currentQ,       setCurrentQ]      = useState(question);
  const [feedback,       setFeedback]      = useState(null);
  const [pendingNextQ,   setPendingNextQ]  = useState(null);
  const [answer,         setAnswer]        = useState("");
  const [loading,        setLoading]       = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [animKey,        setAnimKey]       = useState(0);
  const [questionNum,    setQuestionNum]   = useState(1);
  const [isSpeaking,     setIsSpeaking]    = useState(false);

  const totalAnswered = useRef(0);
  const lastAverage   = useRef(null);

  const questionType = currentQ.isFollowup
    ? `Follow-up ${(currentQ.followupIndex ?? 0) + 1} of 5`
    : "Main Question";

  // ── Shared: call /session/end and hand off to parent ──────
  const _finishSession = useCallback(async ({ early, message }) => {
    stopSpeech();
    setIsSpeaking(false);

    const sid = sessionId || localStorage.getItem(SESSION_KEY);
    setSummaryLoading(true);

    let summaryData = {
      finalSummary:  null,
      totalAnswered: totalAnswered.current,
      averageScore:  lastAverage.current,
    };

    try {
      if (sid) {
        const result = await endSession(sid);
        summaryData = {
          finalSummary:  result.finalSummary,
          totalAnswered: result.totalAnswered,
          averageScore:  result.averageScore,
        };
      }
    } catch (err) {
      console.warn("[InterviewPage] endSession failed:", err.message);
    } finally {
      setSummaryLoading(false);
      localStorage.removeItem(SESSION_KEY);
    }

    if (early) {
      onEnd({ message, ...summaryData });
    } else {
      onExhausted({ message, ...summaryData });
    }
  }, [sessionId, onEnd, onExhausted]);

  // ── Tab-switch warning hook ───────────────────────────────
  // Only active while the candidate is actively answering a question.
  // Paused during loading (waiting for ML), feedback reading, and
  // summary generation — those states are out of the candidate's control.
  const tabListenerActive = !loading && !feedback && !summaryLoading;

  const handleForcedEnd = useCallback(() => {
    _finishSession({
      early:   true,
      message: "Interview terminated: repeated tab switching detected.",
    });
  }, [_finishSession]);

  const { violations, maxViolations, showWarning, acknowledgeWarning } =
    useTabWarning({
      active:     tabListenerActive,
      onForceEnd: handleForcedEnd,
    });

  // ── TTS: speak review when new feedback arrives ───────────
  useEffect(() => {
    if (!feedback?.review || !isSpeechSupported()) return;

    speak(feedback.review, {
      lang:    "en-US",
      rate:    0.95,
      pitch:   1,
      onStart: () => setIsSpeaking(true),
      onEnd:   () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });

    return () => {
      stopSpeech();
      setIsSpeaking(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  // ── Submit answer ─────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const trimmed = answer.trim();
    if (!trimmed) return onError("Please write an answer before submitting.");

    const sid = sessionId || localStorage.getItem(SESSION_KEY);
    if (!sid) return onError("No active session. Please refresh.");

    stopSpeech();
    setIsSpeaking(false);
    setLoading(true);
    setFeedback(null);
    setPendingNextQ(null);

    try {
      const data = await submitAnswer(sid, trimmed);

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
        setTimeout(() => onEnd({ message: "Session expired.", early: true }), 1500);
        return;
      }
      onError(err.response?.data?.error ?? err.message ?? "Submission failed.");
    } finally {
      setLoading(false);
    }
  }, [answer, sessionId, onEnd, onError]);

  // ── Next Question ─────────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (!pendingNextQ) return;

    stopSpeech();
    setIsSpeaking(false);

    if (pendingNextQ.exhausted) {
      await _finishSession({ early: false, message: pendingNextQ.message });
      return;
    }

    if (!pendingNextQ.isFollowup) setQuestionNum(n => n + 1);
    setCurrentQ(pendingNextQ);
    setAnswer("");
    setFeedback(null);
    setPendingNextQ(null);
    setAnimKey(k => k + 1);
  }, [pendingNextQ, _finishSession]);

  // ── Manual withdraw ───────────────────────────────────────
  const handleEnd = useCallback(async () => {
    if (!window.confirm("End the interview early? A summary of your answers so far will be generated.")) return;
    await _finishSession({ early: true, message: "Interview ended early." });
  }, [_finishSession]);

  // ── Render ────────────────────────────────────────────────
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
            summaryLoading={summaryLoading}
            isSpeaking={isSpeaking}
          />
        )}

        {!feedback && (
          <AnswerBox
            answer={answer}
            onChange={setAnswer}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}

        <div className="btn-end-row">
          <button
            className="btn-end"
            onClick={handleEnd}
            disabled={summaryLoading || loading}
          >
            {summaryLoading ? (
              <><span className="spinner spinner--sm" /> Generating summary…</>
            ) : (
              "Withdraw from Interview"
            )}
          </button>
        </div>

      </div>

      {/* Tab-switch warning modal — rendered outside the scroll container
          so it always sits above all content regardless of scroll position */}
      {showWarning && (
        <TabWarningModal
          violations={violations}
          maxViolations={maxViolations}
          onAcknowledge={acknowledgeWarning}
        />
      )}

    </main>
  );
}