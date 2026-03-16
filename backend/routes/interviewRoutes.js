import { Router } from "express";
import { startInterview, submitAnswer, endSession } from "../controllers/interviewController.js";

const router = Router();

// POST /api/interview/session/start
// Body:     { role }
// Response: { sessionId, questionText, topic, isFollowup, followupIndex, difficulty }
router.post("/session/start", startInterview);

// POST /api/interview/answer
// Body:     { sessionId, answer }
// Response: { score, average, questionText, topic, isFollowup, followupIndex, difficulty }
// This single endpoint drives the entire adaptive interview loop.
router.post("/answer", submitAnswer);

// POST /api/interview/session/end
// Body:     { sessionId }
// Response: { finalSummary, totalAnswered, averageScore }
// Triggers the Python /final_summary/ call and closes the session.
router.post("/session/end", endSession);

export default router;