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