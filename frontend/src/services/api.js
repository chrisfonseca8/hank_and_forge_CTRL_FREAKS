import axios from "axios";

const BASE_URL = "http://localhost:3000/api/interview";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Start a new interview session.
 * @param {string} role - "Backend Engineer" | "Machine Learning Engineer"
 * @returns {{ sessionId, questionText, topic, difficulty, isFollowup, followupIndex, average }}
 */
export const startSession = async (role) => {
  const { data } = await api.post("/session/start", { role });
  return data;
};

/**
 * Submit an answer and receive the next question.
 * @param {string} sessionId
 * @param {string} answer
 * @returns {{ score, average, questionText, topic, difficulty, isFollowup, followupIndex, exhausted?, message? }}
 */
export const submitAnswer = async (sessionId, answer) => {
  const { data } = await api.post("/answer", { sessionId, answer });
  return data;
};

/**
 * End the session and retrieve the AI final summary.
 * Called when the candidate finishes or withdraws early.
 * @param {string} sessionId
 * @returns {{ finalSummary: string, totalAnswered: number, averageScore: number|null }}
 */
export const endSession = async (sessionId) => {
  const { data } = await api.post("/session/end", { sessionId });
  return data;
};