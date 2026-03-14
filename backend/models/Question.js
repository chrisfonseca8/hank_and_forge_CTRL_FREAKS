import mongoose from "mongoose";

const followupSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    maxScore: {
      type: Number,
      default: 5,
    },
  },
  { _id: true }
);

const mainQuestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    maxScore: {
      type: Number,
      default: 10,
    },
    upperThreshold: {
      type: Number,
      default: 0.8,
    },
    lowerThreshold: {
      type: Number,
      default: 0.4,
    },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["Backend Engineer", "Machine Learning Engineer"],
      index: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: [1, "Difficulty must be at least 1 (easiest)"],
      max: [10, "Difficulty must be at most 10 (very hard)"],
      index: true,
    },
    mainQuestion: {
      type: mainQuestionSchema,
      required: true,
    },
    followups: {
      type: [followupSchema],
      validate: {
        validator: (arr) => arr.length === 5,
        message: "Each topic must have exactly 5 follow-up questions.",
      },
    },
    evaluationPoints: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 4 && arr.length <= 6,
        message: "Each topic must have between 4 and 6 evaluation points.",
      },
    },
  },
  {
    timestamps: true,
    collection: "questions",
  }
);

// Compound indexes for efficient adaptive lookups
questionSchema.index({ role: 1, difficulty: 1 });
questionSchema.index({ role: 1, topic: 1 }, { unique: true });


export default mongoose.model("Question", questionSchema);