import Question from "../models/Question.js";
import InterviewSession from "../models/InterviewSession.js";

// ─────────────────────────────────────────────────────────────
// POST /api/interview/start
// Body: { role }
// ─────────────────────────────────────────────────────────────
export const startInterview = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "role is required." });
    }

    const STARTING_DIFFICULTY = 5;

    // Pick a random question matching role + starting difficulty
    const results = await Question.aggregate([
      { $match: { role, difficulty: STARTING_DIFFICULTY } },
      { $sample: { size: 1 } },
    ]);

    if (!results.length) {
      return res.status(404).json({
        error: `No questions found for role "${role}" at difficulty ${STARTING_DIFFICULTY}.`,
      });
    }

    const question = results[0];

    // Create a new session
    const session = await InterviewSession.create({
      role,
      difficulty: STARTING_DIFFICULTY,
      currentQuestion: question._id,
      followupIndex: 0,
      askedQuestions: [question._id],
    });

    return res.status(201).json({
      sessionId: session._id,
      question: question.mainQuestion.text,
    });
  } catch (err) {
    console.error("[startInterview]", err);
    return res.status(500).json({ error: "Failed to start interview session." });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/interview/answer
// Body: { sessionId, answer }
// ─────────────────────────────────────────────────────────────
export const submitAnswer = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }

    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({ error: "A non-empty answer is required." });
    }

    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    // Dummy score between 0 and 1 (2 decimal places)
    const score = parseFloat(Math.random().toFixed(2));

    return res.status(200).json({ score });
  } catch (err) {
    console.error("[submitAnswer]", err);
    return res.status(500).json({ error: "Failed to submit answer." });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/interview/next
// Query: ?sessionId=<id>
// ─────────────────────────────────────────────────────────────
export const nextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId query param is required." });
    }

    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    // Find a new question at the same difficulty, excluding already asked ones
    const results = await Question.aggregate([
      {
        $match: {
          role: session.role,
          difficulty: session.difficulty,
          _id: { $nin: session.askedQuestions },
        },
      },
      { $sample: { size: 1 } },
    ]);

    if (!results.length) {
      return res.status(200).json({
        message: "No more questions available at this difficulty level.",
        exhausted: true,
      });
    }

    const question = results[0];

    // Update session: new current question, reset followupIndex, push to history
    session.currentQuestion = question._id;
    session.followupIndex = 0;
    session.askedQuestions.push(question._id);
    await session.save();

    return res.status(200).json({
      question: question.mainQuestion.text,
      followups: question.followups,
    });
  } catch (err) {
    console.error("[nextQuestion]", err);
    return res.status(500).json({ error: "Failed to fetch next question." });
  }
};
