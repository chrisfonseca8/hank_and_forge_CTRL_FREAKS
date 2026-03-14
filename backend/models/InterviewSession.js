import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ["Backend Engineer", "Machine Learning Engineer"],
  },
  difficulty: {
    type: Number,
    default: 5,
  },
  currentQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    default: null,
  },
  followupIndex: {
    type: Number,
    default: 0,
  },
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

const InterviewSession = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);

export default InterviewSession;
