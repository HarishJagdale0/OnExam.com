// OnExam - Single File Backend Demo

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ====== DB CONNECT ======
mongoose.connect("mongodb://127.0.0.1:27017/onexam", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ====== MODELS ======
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "student" }
});

const Exam = mongoose.model("Exam", {
  title: String,
  duration: Number,
  questions: [
    {
      question: String,
      options: [String],
      answer: String
    }
  ]
});

const Result = mongoose.model("Result", {
  userId: String,
  examId: String,
  score: Number
});

// ====== ROUTES ======

// Auth
app.post("/api/register", async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

app.post("/api/login", async (req, res) => {
  const user = await User.findOne(req.body);
  if (!user) return res.status(401).json({ msg: "Invalid credentials" });
  res.json(user);
});

// Create Exam
app.post("/api/exam", async (req, res) => {
  const exam = await Exam.create(req.body);
  res.json(exam);
});

// Get Exams
app.get("/api/exam", async (req, res) => {
  const exams = await Exam.find();
  res.json(exams);
});

// Get Single Exam
app.get("/api/exam/:id", async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  res.json(exam);
});

// Submit Exam
app.post("/api/submit", async (req, res) => {
  const { userId, examId, answers } = req.body;

  const exam = await Exam.findById(examId);

  let score = 0;

  exam.questions.forEach((q, index) => {
    if (answers[index] === q.answer) {
      score++;
    }
  });

  const result = await Result.create({
    userId,
    examId,
    score
  });

  res.json({ score, result });
});

// Get Results
app.get("/api/results", async (req, res) => {
  const results = await Result.find();
  res.json(results);
});

// ====== SERVER ======
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
