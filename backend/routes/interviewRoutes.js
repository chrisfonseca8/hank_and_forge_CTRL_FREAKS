import { Router } from "express";
import {
  startInterview,
  submitAnswer,
  nextQuestion,
} from "../controllers/interviewController.js";

const router = Router();

// POST /api/interview/start   — begin a new session, receive first question
router.post("/start", startInterview);

// POST /api/interview/answer  — submit an answer, receive a score
router.post("/answer", submitAnswer);

// GET  /api/interview/next    — request the next question
router.get("/next", nextQuestion);

export default router;
