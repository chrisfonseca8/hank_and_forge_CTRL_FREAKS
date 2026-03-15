// utils/scoring.js
// Pure functions only — no DB, no session mutation.

export const UPPER_THRESHOLD = 0.65;
export const LOWER_THRESHOLD = 0.4;
export const MAX_DIFFICULTY  = 10;
export const MIN_DIFFICULTY  = 1;

// ── Normalisation ────────────────────────────────────────────

/** Raw main-question score (out of 10) → [0, 1] */
export const normalizeMainScore = (raw) =>
  parseFloat((raw / 10).toFixed(4));

/** Raw followup score (out of 5) → [0, 1] */
export const normalizeFollowupScore = (raw) =>
  parseFloat((raw / 5).toFixed(4));

// ── Aggregation ──────────────────────────────────────────────

/** Arithmetic mean of a scores array. Returns 0 for empty array. */
export const getAverage = (scores) => {
  if (!scores.length) return 0;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return parseFloat((sum / scores.length).toFixed(4));
};

// ── Threshold classification ──────────────────────────────────

/**
 * Classify a normalised score against the thresholds.
 * @returns {'upper' | 'lower' | 'middle'}
 */
export const checkThreshold = (value) => {
  if (value >= UPPER_THRESHOLD) return "upper";
  if (value <= LOWER_THRESHOLD) return "lower";
  return "middle";
};

// ── Distance tiebreak ─────────────────────────────────────────

/**
 * When all followups are exhausted without crossing a threshold,
 * pick the direction the average is closer to.
 * @returns {'upper' | 'lower'}
 */
export const resolveByDistance = (average) => {
  const toUpper = Math.abs(UPPER_THRESHOLD - average);
  const toLower = Math.abs(average - LOWER_THRESHOLD);
  return toUpper <= toLower ? "upper" : "lower";
};

// ── Difficulty arithmetic ─────────────────────────────────────

/**
 * Adjust difficulty by ±1 and clamp to [MIN_DIFFICULTY, MAX_DIFFICULTY].
 * @param {number} current
 * @param {'upper' | 'lower'} direction
 * @returns {number}
 */
export const adjustDifficulty = (current, direction) => {
  const delta = direction === "upper" ? 1 : -1;
  return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, current + delta));
};

// ── Dummy scorer ──────────────────────────────────────────────

/**
 * Generates a random raw score in [0, maxScore].
 * REPLACE this function body when real AI scoring is wired in.
 */
export const dummyRawScore = (maxScore) =>
  parseFloat((Math.random() * maxScore).toFixed(2));
