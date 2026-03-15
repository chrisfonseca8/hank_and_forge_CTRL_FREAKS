// models/EvaluatedAnswer.js
// Stores every answer that was evaluated by the ML service.
// Used for audit trails, review, and potential retraining data.

import mongoose from "mongoose";

const evaluatedAnswerSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewSession",
    required: true,
    index: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },

  // The exact text of the question that was answered
  questionText: {
    type: String,
    required: true,
  },

  // Whether this was a followup or main question
  isFollowup: {
    type: Boolean,
    default: false,
  },

  followupIndex: {
    type: Number,
    default: null,
  },

  // The candidate's raw answer text
  answer: {
    type: String,
    required: true,
  },

  // aggregate_score returned by the ML API — already normalised [0, 1]
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },

  // Full review text returned by the ML API
  review: {
    type: String,
    default: "",
  },

  // Extra ML fields stored for analysis
  llmScore: {
    type: Number,
    default: null,
  },

  avgSimilarity: {
    type: Number,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("EvaluatedAnswer", evaluatedAnswerSchema);
