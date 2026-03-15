// services/sessionService.js
// Every database read/write goes through here.
// The controller never touches Mongoose directly.

import Question from "../models/Question.js";
import InterviewSession from "../models/InterviewSession.js";
import { adjustDifficulty, MIN_DIFFICULTY, MAX_DIFFICULTY } from "../utils/scoring.js";

// ── Question fetching ─────────────────────────────────────────

/**
 * Fetch one random question for the given role and difficulty,
 * excluding IDs in askedQuestions.
 *
 * If no question is found at the requested difficulty, this function
 * walks outward from that difficulty (trying ±1, ±2, …) until it
 * finds an available question or exhausts the entire 1–10 range.
 *
 * @returns {object|null} raw aggregate document or null
 */
export const fetchQuestion = async (role, difficulty, askedQuestions = []) => {
  // Try exact difficulty first
  const exact = await _queryOne(role, difficulty, askedQuestions);
  if (exact) return exact;

  // Fallback: search outward from target difficulty
  for (let delta = 1; delta <= MAX_DIFFICULTY - MIN_DIFFICULTY; delta++) {
    const higher = difficulty + delta;
    const lower  = difficulty - delta;

    if (higher <= MAX_DIFFICULTY) {
      const q = await _queryOne(role, higher, askedQuestions);
      if (q) return q;
    }
    if (lower >= MIN_DIFFICULTY) {
      const q = await _queryOne(role, lower, askedQuestions);
      if (q) return q;
    }
  }

  return null; // entire pool exhausted
};

/** Internal: single aggregate query for one question */
const _queryOne = async (role, difficulty, askedQuestions) => {
  const results = await Question.aggregate([
    {
      $match: {
        role,
        difficulty,
        _id: { $nin: askedQuestions },
      },
    },
    { $sample: { size: 1 } },
  ]);
  return results[0] ?? null;
};

// ── Session creation ──────────────────────────────────────────

/**
 * Start a brand-new session, fetch the opening question, and persist both.
 * Throws a shaped error (with statusCode) if no question can be found.
 *
 * @returns {{ session: InterviewSession, question: object }}
 */
export const createSession = async (role) => {
  const STARTING_DIFFICULTY = 5;

  const question = await fetchQuestion(role, STARTING_DIFFICULTY);
  if (!question) {
    const err = new Error(`No questions found for role "${role}".`);
    err.statusCode = 404;
    throw err;
  }

  const session = await InterviewSession.create({
    role,
    currentDifficulty: STARTING_DIFFICULTY,
    currentQuestionId: question._id,
    isFollowupPhase: false,
    followupIndex: 0,
    scores: [],
    askedQuestions: [question._id],
  });

  return { session, question };
};

// ── Advance to the next main question ────────────────────────

/**
 * After a threshold decision:
 *  1. Adjust difficulty by ±1 (clamped).
 *  2. Fetch the next question (with fallback search).
 *  3. Reset session state and save.
 *
 * @param {InterviewSession} session
 * @param {'upper'|'lower'}  direction
 * @returns {{ session, question: object|null }}
 */
export const advanceToNextQuestion = async (session, direction) => {
  const newDifficulty = adjustDifficulty(session.currentDifficulty, direction);
  const nextQ = await fetchQuestion(role(session), newDifficulty, session.askedQuestions);

  session.currentDifficulty = newDifficulty;
  session.isFollowupPhase   = false;
  session.followupIndex     = 0;
  session.scores            = [];

  if (nextQ) {
    session.currentQuestionId = nextQ._id;
    session.askedQuestions.push(nextQ._id);
  } else {
    session.currentQuestionId = null;
  }

  await session.save();
  return { session, question: nextQ };
};

// Small helper so callers don't reach into session internals
const role = (session) => session.role;

// ── Followup phase management ─────────────────────────────────

/**
 * Switch the session into followup mode.
 * followupIndex is reset to 0 so the first followup is served.
 */
export const enterFollowupPhase = async (session) => {
  session.isFollowupPhase = true;
  session.followupIndex   = 0;
  await session.save();
  return session;
};

/**
 * Record a followup score and advance to the next followup slot.
 * Both mutations happen atomically in the same .save() call.
 */
export const recordFollowupAndAdvance = async (session, normalizedScore) => {
  session.scores.push(normalizedScore);
  session.followupIndex += 1;
  await session.save();
  return session;
};

/**
 * Append a normalised score to the session without touching followupIndex.
 * Used after scoring the main question.
 */
export const appendScore = async (session, normalizedScore) => {
  session.scores.push(normalizedScore);
  await session.save();
  return session;
};

// ── Load current question ─────────────────────────────────────

/** Fetch the full Question document for the session's currentQuestionId. */
export const getCurrentQuestion = async (session) => {
  if (!session.currentQuestionId) return null;
  return Question.findById(session.currentQuestionId).lean();
};
