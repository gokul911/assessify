const express = require('express');
const axios = require('axios');
const Users = require('../models/user');
const {verifyToken} = require('./auth');
const router = express.Router();

router.get("/exams", verifyToken, async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.user.email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const subjects = [
        { name: "Mathematics" },
        { name: "Physics" },
        { name: "Chemistry" },
    ];

    // Update status based on completed exams
    const updatedSubjects = subjects.map((subject) => {
        const completedExam = user.exams.find((exam) => exam.subject === subject.name);
        console.log("Completed Exam -> ", completedExam);
        return {
            name: subject.name,
            status: completedExam ? "Completed" : "Pending",
        };
    });
    console.log("Subjects object being sent -> ", updatedSubjects);
    res.json(updatedSubjects);

  } catch (error) {
      res.status(500).json({ message: "Error fetching subjects" });
  }
});

// ******************************************************************************************************************************

router.post("/exam-results", verifyToken, async (req, res) => {
  try {
    const { subject, score, totalMarks, answers } = req.body;
    console.log("user object inserted inside req through verifyToken -> ", req.user);

    const user = await Users.findOne({ email : req.user.email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the user has already completed this exam
    const existingExam = user.exams.find((exam) => exam.subject === subject);
    if (existingExam) {
        return res.status(403).json({ message: "Exam already completed" });
    }

    user.exams.push({subject,score,totalMarks,answers});
    await user.save();

    res.status(201).json({ message: "Result saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error saving result" });
  }
});

// ******************************************************************************************************************************

// router.get("/exam-analytics", verifyToken, async (req, res) => {
//   try {
//     const user = await Users.findOne({ email: req.user.email });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     const exams = user.exams;
//     const totalExams = exams.length;
//     const totalScore = exams.reduce((acc, exam) => acc + exam.score, 0);
//     const avgScore = totalExams ? (totalScore / totalExams).toFixed(2) : 0;
//     const passRate = totalExams ? ((exams.filter(exam => exam.score >= exam.totalMarks/2).length / totalExams) * 100).toFixed(2) : 0;
//     const completionRate = totalExams ? 100 : 0;

//     res.json({
//       email : req.user.email,
//       totalExams,
//       avgScore,
//       passRate,
//       completionRate,
//       recentExams: exams.slice(-5).reverse(), // Get last 5 exams
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching analytics" });
//   }
// });

// ******************************************************************************************************************************

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const API_KEY = process.env.GOOGLE_API_KEY;
const RANGE = "Sheet1!A2:G";

router.get('/questions', async (req, res) => {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`
    );

    const rows = response.data.values;
    const formattedData = {};

    rows.forEach(([subj, question, option1, option2, option3, option4, answer]) => {
      if (!formattedData[subj]) {
        formattedData[subj] = [];
      }
      formattedData[subj].push({
        question,
        options: [option1, option2, option3, option4],
        answer,
      });
    });

    console.log("Formatted Data is here -> ", formattedData);

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching questions from Google Sheets" });
  }
});

// ******************************************************************************************************************************

router.get("/exam-result/:subject", verifyToken, async (req, res) => {
  try{
    const {subject} = req.params;

    const user = await Users.findOne({email : req.user.email});
    if (!user) return res.status(404).json({ message: "User not found" });

    const reqdSubject = user.exams.find((exam) => exam.subject === subject);

    res.json(reqdSubject);

  } catch(err) {
    console.error("Error fetching exam result:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

module.exports = router;