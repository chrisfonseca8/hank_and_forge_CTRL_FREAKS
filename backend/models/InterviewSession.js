import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ["Backend Engineer", "Machine Learning Engineer"],
  },

  // Difficulty used to fetch the NEXT question (1–10, always clamped)
  currentDifficulty: {
    type: Number,
    default: 5,
    min: 1,
    max: 10,
  },

  // The Question _id currently being evaluated (main or followups)
  currentQuestionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    default: null,
  },

  // false → candidate is answering the main question
  // true  → candidate is answering followup questions
  isFollowupPhase: {
    type: Boolean,
    default: false,
  },

  // Index of the NEXT followup to serve (0–4)
  // Only meaningful when isFollowupPhase === true
  followupIndex: {
    type: Number,
    default: 0,
  },

  // Normalised scores for the CURRENT question context.
  // Includes the main question score + any followup scores so far.
  // Always reset to [] when advancing to a new main question.
  scores: {
    type: [Number],
    default: [],
  },

  // All Question _ids that have been presented — used for $nin exclusion
  askedQuestions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("InterviewSession", interviewSessionSchema);
