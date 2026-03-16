// services/evaluationService.js
//
// Calls the Python ML evaluation service at:
//   POST http://10.62.193.181:8000/evaluate/
//
// Sends:   multipart/form-data  { question, answer, evaluation_points }
// Returns: { aggregate_score, review_text, llm_score, avg_similarity }
//
// aggregate_score is already normalised to [0, 1] — do NOT normalise again.
//
// SLOW RESPONSE HANDLING
// ───────────────────────
// The ML model can take 30–90 seconds to respond.
// This service:
//   • sets a 2-minute axios timeout
//   • retries once on network errors (not on 4xx/5xx)
//   • logs timing on every call so you can monitor latency
// The Express request will stay open until this resolves.
// Make sure your Node HTTP server timeout > ML_TIMEOUT_MS (see server.js note).

import axios from "axios";
import FormData from "form-data";

// ── Config ────────────────────────────────────────────────────
const ML_API_URL     = "http://10.62.193.181:8000/evaluate/";
const ML_TIMEOUT_MS  = 120_000;   // 2 minutes — covers slow model inference
const RETRY_DELAY_MS = 3_000;     // wait 3 s before the single retry
const MAX_RETRIES    = 1;         // 1 retry = 2 total attempts

// ─────────────────────────────────────────────────────────────
// evaluateAnswer(questionText, answer, evaluationPoints)
//
// @param {string}   questionText      The exact question that was asked
// @param {string}   answer            The candidate's answer
// @param {string[]} evaluationPoints  Array of key concepts from Question.evaluationPoints
//
// @returns {{
//   aggregateScore: number,   // [0, 1] — use directly as normalised score
//   reviewText:     string,   // human-readable feedback from the model
//   llmScore:       number,   // raw LLM score (stored for analysis)
//   avgSimilarity:  number,   // semantic similarity (stored for analysis)
// }}
//
// @throws Error if the ML service is unreachable after all retries
// ─────────────────────────────────────────────────────────────
export const evaluateAnswer = async (questionText, answer, evaluationPoints) => {
  // evaluationPoints is a [String] array in Mongoose — join with | for the ML API
  const evalPointsStr = Array.isArray(evaluationPoints)
    ? evaluationPoints.join("|")
    : String(evaluationPoints ?? "");

  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const attemptStart = Date.now();

    try {
      console.log(
        `[evaluationService] attempt ${attempt}/${MAX_RETRIES + 1} — calling ML API`
      );

      const form = new FormData();
      form.append("question",          questionText);
      form.append("answer",            answer);
      form.append("evaluation_points", evalPointsStr);

      const { data } = await axios.post(ML_API_URL, form, {
        headers: {
          ...form.getHeaders(),    // sets correct multipart/form-data boundary
        },
        timeout: ML_TIMEOUT_MS,
        // Don't let axios throw on 4xx/5xx so we can log the body
        validateStatus: (status) => status < 500,
      });

      const elapsed = Date.now() - attemptStart;
      console.log(`[evaluationService] ML API responded in ${elapsed}ms`);

      // ── Validate response shape ──────────────────────────────
      if (data.aggregate_score === undefined || data.aggregate_score === null) {
        throw new Error(
          `ML API returned unexpected shape: ${JSON.stringify(data)}`
        );
      }

      const aggregateScore = parseFloat(data.aggregate_score);

      if (isNaN(aggregateScore) || aggregateScore < 0 || aggregateScore > 1) {
        throw new Error(
          `ML API returned out-of-range aggregate_score: ${data.aggregate_score}`
        );
      }

      return {
        aggregateScore,
        reviewText:    data.review_text     ?? "",
        llmScore:      data.llm_score       ?? null,
        avgSimilarity: data.avg_similarity  ?? null,
      };

    } catch (err) {
      const elapsed = Date.now() - attemptStart;
      lastError = err;

      const isNetworkError = !err.response;
      const isTimeout      = err.code === "ECONNABORTED" || err.code === "ETIMEDOUT";

      console.error(
        `[evaluationService] attempt ${attempt} failed after ${elapsed}ms — ` +
        `${isTimeout ? "TIMEOUT" : isNetworkError ? "NETWORK ERROR" : "ERROR"}: ` +
        err.message
      );

      // Only retry on network/timeout errors, not on bad responses
      const shouldRetry = attempt <= MAX_RETRIES && (isNetworkError || isTimeout);

      if (shouldRetry) {
        console.log(`[evaluationService] retrying in ${RETRY_DELAY_MS}ms…`);
        await _sleep(RETRY_DELAY_MS);
        continue;
      }

      break;
    }
  }

  // All attempts failed — throw a shaped error the controller can catch
  const error = new Error(
    `ML evaluation service unavailable after ${MAX_RETRIES + 1} attempt(s): ` +
    (lastError?.message ?? "unknown error")
  );
  error.statusCode = 503;
  error.isMLError  = true;
  throw error;
};

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────
const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


// ─────────────────────────────────────────────────────────────
// getFinalSummary(allReviews)
//
// Calls POST http://10.62.193.181:8000/final_summary/
// with the full list of per-question review texts collected
// across the interview session.
//
// The Python API expects: JSON body → List[str]
// Returns: { "final_summary": "..." }
//
// @param {string[]} allReviews  Every review_text from this session
// @returns {string}             The final summary paragraph
// ─────────────────────────────────────────────────────────────
export const getFinalSummary = async (allReviews = []) => {
  // If no answers were evaluated yet (early withdrawal with 0 questions),
  // skip the network call entirely.
  if (!allReviews.length) {
    return "No answers were submitted during this session.";
  }

  const SUMMARY_URL = "http://10.62.193.181:8000/final_summary/";
  const startTime   = Date.now();

  try {
    console.log(`[evaluationService] calling /final_summary/ with ${allReviews.length} review(s)`);

    const { data } = await axios.post(
      SUMMARY_URL,
      allReviews,          // JSON array body — matches List[str] = Body(...) in FastAPI
      {
        headers: { "Content-Type": "application/json" },
        timeout: ML_TIMEOUT_MS,
        validateStatus: (status) => status < 500,
      }
    );

    const elapsed = Date.now() - startTime;
    console.log(`[evaluationService] /final_summary/ responded in ${elapsed}ms`);

    return data.final_summary ?? "Summary unavailable.";

  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error(
      `[evaluationService] /final_summary/ failed after ${elapsed}ms: ${err.message}`
    );
    // Non-fatal — return a graceful fallback so the end page still loads
    return "Final summary could not be generated at this time.";
  }
};