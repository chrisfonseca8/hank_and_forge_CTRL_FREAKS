
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import express from 'express'


dotenv.config();

const app = express();

// middleware
app.use(express.json());

/*
  MongoDB Connection
*/
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

/*
  Test Route
*/
app.get("/", (req, res) => {
  res.send("Interview Platform Backend Running 🚀");
});


import interviewRoutes from "./routes/interviewRoutes.js";

app.use("/api/interview", interviewRoutes);

/*
  Start Server
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});