// public/interview.js
// Drop this file in your frontend and call startInterview() on page load.
// It handles sessionId storage automatically — the user never sees it.

const API_BASE  = "http://localhost:5000/api/interview"; // adjust to your server URL
const SESSION_KEY = "interviewSessionId";

// ── Session ID management ─────────────────────────────────────

const getStoredSessionId = () => localStorage.getItem(SESSION_KEY);

const storeSessionId    = (id) => localStorage.setItem(SESSION_KEY, id);

const clearSession      = () => localStorage.removeItem(SESSION_KEY);

// ─────────────────────────────────────────────────────────────
// startInterview(role)
//
// Call this when the interview page loads.
// - If a sessionId already exists in localStorage, the previous
//   session is reused (the backend will restore its state).
// - If no sessionId exists, a new session is created.
//
// @param {string} role  "Backend Engineer" | "Machine Learning Engineer"
// @returns {object}     First question payload
// ─────────────────────────────────────────────────────────────
export const startInterview = async (role) => {
  // Resume existing session if available
  const existingId = getStoredSessionId();
  if (existingId) {
    console.log("[interview] Resuming session:", existingId);
    // Return a sentinel so the caller knows to just wait for /answer calls
    return { resumed: true, sessionId: existingId };
  }

  // Create a fresh session
  const res  = await fetch(`${API_BASE}/session/start`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ role }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to start interview.");
  }

  // Persist the sessionId — never ask the user for it
  storeSessionId(data.sessionId);
  console.log("[interview] New session created:", data.sessionId);

  return data; // { sessionId, questionText, topic, isFollowup, followupIndex, difficulty }
};

// ─────────────────────────────────────────────────────────────
// submitAnswer(answer)
//
// Call this whenever the candidate submits an answer.
// Automatically attaches the stored sessionId.
//
// @param  {string} answer  The candidate's text answer
// @returns {object}        Next question payload
//   {
//     score,          // normalised score for this answer (0–1)
//     average,        // running average including all scores so far
//     questionText,   // next question to display
//     topic,          // subject area of the next question
//     isFollowup,     // true if this is a followup question
//     followupIndex,  // which followup (0–4), or null for main questions
//     difficulty,     // current difficulty level (1–10)
//     exhausted?,     // true if the question pool is empty
//     message?,       // human-readable status message when exhausted
//   }
// ─────────────────────────────────────────────────────────────
export const submitAnswer = async (answer) => {
  const sessionId = getStoredSessionId();

  if (!sessionId) {
    throw new Error("No active session. Call startInterview() first.");
  }

  const res = await fetch(`${API_BASE}/answer`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ sessionId, answer }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Session expired or invalid — clear storage so a fresh one can start
    if (res.status === 404) {
      clearSession();
      throw new Error("Session expired. Please refresh to start a new interview.");
    }
    throw new Error(data.error ?? "Failed to submit answer.");
  }

  // If the interview is complete, clean up localStorage
  if (data.exhausted) {
    clearSession();
  }

  return data;
};

// ─────────────────────────────────────────────────────────────
// endInterview()
//
// Call this if the user manually ends the interview early.
// ─────────────────────────────────────────────────────────────
export const endInterview = () => {
  clearSession();
  console.log("[interview] Session cleared.");
};
