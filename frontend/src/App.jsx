// src/App.jsx

import { useState, useEffect, useRef } from "react";
import SetupPage     from "./components/SetupPage";
import InterviewPage from "./components/InterviewPage";
import EndPage       from "./components/EndPage";
import { startSession } from "./services/api";
import "./styles/main.css";

const SESSION_KEY = "interviewSessionId";
const PAGE = { SETUP: "setup", INTERVIEW: "interview", END: "end" };

export default function App() {
  const [page,          setPage]          = useState(PAGE.SETUP);
  const [sessionId,     setSessionId]     = useState(null);
  const [question,      setQuestion]      = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [selectedRole,  setSelectedRole]  = useState("");
  const [starting,      setStarting]      = useState(false);

  // Final report data passed from InterviewPage when session ends
  const [endReport, setEndReport] = useState(null);

  // Toast
  const [toastMsg,  setToastMsg]  = useState("");
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef(null);

  const showError = (msg) => {
    setToastMsg(msg);
    setToastShow(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 4000);
  };

  // Clear any orphaned session on mount
  useEffect(() => { localStorage.removeItem(SESSION_KEY); }, []);

  // ── Start interview ──────────────────────────────────────
  const handleStart = async ({ role, name }) => {
    setStarting(true);
    setCandidateName(name);
    setSelectedRole(role);
    try {
      const data = await startSession(role);
      localStorage.setItem(SESSION_KEY, data.sessionId);
      setSessionId(data.sessionId);
      setQuestion(data);
      setPage(PAGE.INTERVIEW);
    } catch (err) {
      showError(err.response?.data?.error ?? err.message ?? "Failed to start.");
    } finally {
      setStarting(false);
    }
  };

  // ── End interview (early OR exhausted) ─────────────────────
  // Both paths now receive the same object shape from InterviewPage:
  // { message, finalSummary, totalAnswered, averageScore, early }
  const handleEnd = ({ message, finalSummary, totalAnswered, averageScore } = {}) => {
    setEndReport({
      message,
      finalSummary:   finalSummary ?? null,
      average:        averageScore ?? null,
      questionsAnswered: totalAnswered ?? null,
      early: true,
    });
    setPage(PAGE.END);
  };

  // ── Pool exhausted — carry final stats + summary to EndPage ──
  const handleExhausted = ({ message, finalSummary, totalAnswered, averageScore }) => {
    setEndReport({
      message,
      finalSummary:   finalSummary ?? null,
      average:        averageScore ?? null,
      questionsAnswered: totalAnswered ?? null,
      early: false,
    });
    setPage(PAGE.END);
  };

  // ── Restart ──────────────────────────────────────────────
  const handleRestart = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setQuestion(null);
    setCandidateName("");
    setSelectedRole("");
    setEndReport(null);
    setPage(PAGE.SETUP);
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="app">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="app-header">
        <span className="logo">◈ RecruitSM AI</span>

        {/* Show candidate context once interview has started */}
        {page === PAGE.INTERVIEW && candidateName && (
          <div className="header-context">
            <span className="header-candidate">{candidateName}</span>
            <span className="header-sep">·</span>
            <span className="header-role">{selectedRole}</span>
            {sessionId && (
              <>
                <span className="header-sep">·</span>
                <span className="session-badge">ID {sessionId.slice(-6)}</span>
              </>
            )}
          </div>
        )}
      </header>

      {/* ── Pages ───────────────────────────────────────── */}
      {page === PAGE.SETUP && (
        <SetupPage onStart={handleStart} loading={starting} />
      )}

      {page === PAGE.INTERVIEW && question && (
        <InterviewPage
          question={question}
          sessionId={sessionId}
          candidateName={candidateName}
          role={selectedRole}
          onEnd={handleEnd}
          onError={showError}
          onExhausted={handleExhausted}
        />
      )}

      {page === PAGE.END && (
        <EndPage
          candidateName={candidateName}
          role={selectedRole}
          report={endReport}
          onRestart={handleRestart}
        />
      )}

      {/* ── Toast ───────────────────────────────────────── */}
      <div className={`toast ${toastShow ? "show" : ""}`}>{toastMsg}</div>
    </div>
  );
}