// controllers/interviewController.js

import InterviewSession  from "../models/InterviewSession.js";
import EvaluatedAnswer   from "../models/EvaluatedAnswer.js";
import {
  createSession,
  getCurrentQuestion,
  enterFollowupPhase,
  recordFollowupAndAdvance,
  advanceToNextQuestion,
  appendScore,
} from "../services/sessionService.js";
import {
  // normalizeMainScore and normalizeFollowupScore are NOT used here.
  // The ML aggregate_score is already normalised to [0,1].
  // All other scoring.js functions remain untouched.
  checkThreshold,
  resolveByDistance,
  getAverage,
} from "../utils/scoring.js";
import { evaluateAnswer, getFinalSummary } from "../services/evaluationService.js";

// ─────────────────────────────────────────────────────────────
// Internal helper — builds the standard response payload.
// Every endpoint that returns a question uses this shape.
// ─────────────────────────────────────────────────────────────
const buildResponse = (extras, question, session, isFollowup) => {
  const questionText = isFollowup
    ? question.followups[session.followupIndex].text
    : question.mainQuestion.text;

  return {
    ...extras,
    questionText,
    topic:         question.topic,
    isFollowup,
    followupIndex: isFollowup ? session.followupIndex : null,
    difficulty:    session.currentDifficulty,
  };
};

// ─────────────────────────────────────────────────────────────
// Internal helper — fire-and-forget answer persistence.
// Errors here are logged but never allowed to break the
// main request/response cycle.
// ─────────────────────────────────────────────────────────────
const _persistAnswer = (fields) => {
  EvaluatedAnswer.create(fields).catch((err) =>
    console.error("[interviewController] Failed to persist evaluated answer:", err.message)
  );
};

// ─────────────────────────────────────────────────────────────
// POST /api/interview/session/start
// Body:     { role: "Backend Engineer" }
// Response: { sessionId, questionText, topic, isFollowup,
//             followupIndex, difficulty }
// ─────────────────────────────────────────────────────────────
export const startInterview = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "role is required." });
    }

    const validRoles = ["Backend Engineer", "Machine Learning Engineer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    const { session, question } = await createSession(role);

    return res.status(201).json({
      sessionId: session._id,
      ...buildResponse({}, question, session, false),
    });
  } catch (err) {
    console.error("[startInterview]", err);
    return res.status(err.statusCode ?? 500).json({
      error: err.message ?? "Failed to start interview.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/interview/answer
// Body:     { sessionId, answer }
//
// ── Full flow ────────────────────────────────────────────────
//
//  1. Load session + current question
//  2. Determine question text (main or followup)
//  3. Call ML evaluation API  ← replaces dummyRawScore()
//  4. aggregate_score is already [0,1] — push directly to session.scores
//  5. Compute running average with getAverage()         ← scoring.js
//  6. Classify with checkThreshold()                    ← scoring.js
//  7. Advance difficulty with adjustDifficulty()        ← via sessionService
//  8. Persist the evaluated answer asynchronously
//  9. Return next question or exhausted signal
//
// NOTE ON LATENCY
// The ML model can take 30–90 seconds.
// The HTTP connection stays open until evaluateAnswer() resolves.
// The frontend submit button shows a spinner for the full duration.
// Make sure server.timeout > 120_000 in server.js (see note below).
//
// Response: { score, average, reviewText, questionText, topic,
//             isFollowup, followupIndex, difficulty }
// ─────────────────────────────────────────────────────────────
export const submitAnswer = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    // ── Input validation ──────────────────────────────────────
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }
    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({ error: "A non-empty answer is required." });
    }

    // ── Load session ──────────────────────────────────────────
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    // ── Load current question ─────────────────────────────────
    const currentQuestion = await getCurrentQuestion(session);
    if (!currentQuestion) {
      return res.status(404).json({ error: "Current question not found." });
    }

    // ── Resolve the exact text being answered ─────────────────
    // For the ML API we must send the specific question that was asked,
    // not just the main question text.
    const isAnsweringFollowup = session.isFollowupPhase;
    const questionText = isAnsweringFollowup
      ? currentQuestion.followups[session.followupIndex].text
      : currentQuestion.mainQuestion.text;

    // ── Call ML evaluation API ────────────────────────────────
    // evaluationPoints is a [String] array; evaluationService joins them.
    // aggregate_score is already in [0,1] — NO further normalisation.
    let mlResult;
    try {
      mlResult = await evaluateAnswer(
        questionText,
        answer.trim(),
        currentQuestion.evaluationPoints
      );
    } catch (mlErr) {
      console.error("[submitAnswer] ML evaluation failed:", mlErr.message);
      // Return 503 so the frontend can show a meaningful message
      return res.status(mlErr.statusCode ?? 503).json({
        error: "The evaluation service is temporarily unavailable. Please try again.",
      });
    }

    const { aggregateScore, reviewText, llmScore, avgSimilarity } = mlResult;

    // ═════════════════════════════════════════════════════════
    // BRANCH A — Candidate answered the MAIN question
    // ═════════════════════════════════════════════════════════
    if (!isAnsweringFollowup) {
      // Push ML score directly — it is already normalised [0,1]
      await appendScore(session, aggregateScore);

      // Persist answer record (non-blocking)
      _persistAnswer({
        sessionId:     session._id,
        questionId:    currentQuestion._id,
        questionText,
        isFollowup:    false,
        followupIndex: null,
        answer:        answer.trim(),
        score:         aggregateScore,
        review:        reviewText,
        llmScore,
        avgSimilarity,
      });

      const decision = checkThreshold(aggregateScore);

      // ── Decisive score → skip followups, move to next question
      if (decision !== "middle") {
        return await _nextQuestionResponse(
          res, session, decision, aggregateScore, aggregateScore, reviewText
        );
      }

      // ── Middle score → enter followup phase ──────────────────
      const updatedSession = await enterFollowupPhase(session);

      return res.status(200).json(
        buildResponse(
          { score: aggregateScore, average: aggregateScore, reviewText },
          currentQuestion,
          updatedSession,
          true  // isFollowup
        )
      );
    }

    // ═════════════════════════════════════════════════════════
    // BRANCH B — Candidate answered a FOLLOWUP question
    // ═════════════════════════════════════════════════════════

    // Guard: followup index must still be in bounds
    if (session.followupIndex >= currentQuestion.followups.length) {
      return res.status(409).json({
        error: "All followups for this question have already been answered.",
      });
    }

    // Persist followup answer (non-blocking)
    _persistAnswer({
      sessionId:     session._id,
      questionId:    currentQuestion._id,
      questionText,
      isFollowup:    true,
      followupIndex: session.followupIndex,
      answer:        answer.trim(),
      score:         aggregateScore,
      review:        reviewText,
      llmScore,
      avgSimilarity,
    });

    // Push ML score + increment followupIndex atomically
    await recordFollowupAndAdvance(session, aggregateScore);

    // Running average: main question score + all followup scores so far
    const average  = getAverage(session.scores);
    const decision = checkThreshold(average);

    // ── Average crossed a threshold → move on ─────────────────
    if (decision !== "middle") {
      return await _nextQuestionResponse(
        res, session, decision, aggregateScore, average, reviewText
      );
    }

    // ── All 5 followups exhausted without threshold → tiebreak ─
    const isLastFollowup =
      session.followupIndex >= currentQuestion.followups.length;

    if (isLastFollowup) {
      const direction = resolveByDistance(average);
      return await _nextQuestionResponse(
        res, session, direction, aggregateScore, average, reviewText
      );
    }

    // ── More followups remain, average still in the middle ────
    return res.status(200).json(
      buildResponse(
        { score: aggregateScore, average, reviewText },
        currentQuestion,
        session,
        true
      )
    );

  } catch (err) {
    console.error("[submitAnswer]", err);
    return res.status(500).json({ error: "Failed to process answer." });
  }
};

// ─────────────────────────────────────────────────────────────
// Private — advance session to the next question and build
// the appropriate response. Handles exhausted pool gracefully.
// ─────────────────────────────────────────────────────────────
const _nextQuestionResponse = async (
  res, session, direction, score, average, reviewText
) => {
  const { session: updated, question: nextQuestion } =
    await advanceToNextQuestion(session, direction);

  if (!nextQuestion) {
    return res.status(200).json({
      score,
      average,
      reviewText,
      difficulty: updated.currentDifficulty,
      exhausted:  true,
      message:    "You have answered all available questions. Interview complete.",
    });
  }

  return res.status(200).json(
    buildResponse(
      { score, average, reviewText },
      nextQuestion,
      updated,
      false  // always a fresh main question
    )
  );
};

// ─────────────────────────────────────────────────────────────
// POST /api/interview/session/end
// Body:     { sessionId }
//
// Called by the frontend when:
//   (a) The candidate clicks "Withdraw from Interview" (early end)
//   (b) The question pool is exhausted and the candidate clicks
//       "View Assessment Report"
//
// Flow:
//   1. Load all EvaluatedAnswer documents for this session
//   2. Extract each review_text into an ordered array
//   3. Call Python /final_summary/ with the review array
//   4. Return { finalSummary, totalAnswered, averageScore }
//
// Response: { finalSummary, totalAnswered, averageScore }
// ─────────────────────────────────────────────────────────────
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }

    // ── Fetch all evaluated answers for this session ───────────
    // Sort by createdAt so the summary reflects chronological order.
    const answers = await EvaluatedAnswer.find({ sessionId })
      .sort({ createdAt: 1 })
      .lean();

    // ── Build the reviews array for the Python API ─────────────
    // Filter out empty/null reviews so the model isn't fed blank strings.
    const allReviews = answers
      .map((a) => a.review)
      .filter((r) => r && r.trim() !== "");

    // ── Compute session statistics ─────────────────────────────
    const totalAnswered = answers.length;
    const averageScore  =
      totalAnswered > 0
        ? parseFloat(
            (
              answers.reduce((sum, a) => sum + a.score, 0) / totalAnswered
            ).toFixed(4)
          )
        : null;

    // ── Call Python /final_summary/ ───────────────────────────
    // getFinalSummary never throws — it returns a fallback string on error.
    const finalSummary = await getFinalSummary(allReviews);

    // ── Mark session as ended (best-effort) ───────────────────
    await InterviewSession.findByIdAndUpdate(sessionId, {
      $set: { endedAt: new Date() },
    }).catch((err) =>
      console.warn("[endSession] Could not mark session as ended:", err.message)
    );

    return res.status(200).json({
      finalSummary,
      totalAnswered,
      averageScore,
    });

  } catch (err) {
    console.error("[endSession]", err);
    return res.status(500).json({ error: "Failed to generate final summary." });
  }
};