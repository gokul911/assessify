const express = require('express');
const axios = require('axios');
const Users = require('../models/user');
const Exam = require('../models/exam');
const {verifyToken} = require('./auth');
const router = express.Router();

// router.get("/exams", verifyToken, async (req, res) => {
//   try {
//     const user = await Users.findOne({ email: req.user.email });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     // const subjects = [
//     //     { name: "Mathematics" },
//     //     { name: "Physics" },
//     //     { name: "Chemistry" },
//     // ];

//     // // Update status based on completed exams
//     // const updatedSubjects = subjects.map((subject) => {
//     //     const completedExam = user.exams.find((exam) => exam.subject === subject.name);
//     //     console.log("Completed Exam -> ", completedExam);
//     //     return {
//     //         name: subject.name,
//     //         status: completedExam ? "Completed" : "Pending",
//     //     };
//     // });
//     // console.log("Subjects object being sent -> ", updatedSubjects);
//     // res.json(updatedSubjects);// Fetch all exams from the database
//     const allExams = await Exam.find({});

//     // Format the exam list with subject and status based on user's activity
//     const formattedExams = allExams.map((exam) => {
//       const completedExam = user.exams.find(
//         (e) => e.subject === exam.subject && e.examId?.toString() === exam._id.toString()
//       );

//       return {
//         id: exam._id,
//         name: exam.subject,
//         status: completedExam ? "Completed" : "Pending",
//       };
//     });
//     console.log("/exams formattedExams date -> ", formattedExams);

//     res.json(formattedExams);

//   } catch (error) {
//       res.status(500).json({ message: "Error fetching subjects" });
//   }
// });

router.get("/individual-student-exams", verifyToken, async (req, res) => {
  try {
    const allExams = await Exam.find({}, 'subject'); // global list of all exams with only one field i.e. subject
    const user = await Users.findOne({ email: req.user.email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const userExams = user.exams; // array of { subject, score, status: Completed }

    const merged = allExams.map((exam) => {
      const userExam = userExams.find((e) => e.subject === exam.subject);
      return {
        name: exam.subject,
        status: userExam ? "Completed" : "Pending",
      };
    });

    console.log("response data sent from /api/user/individual-student-exams", merged);

    res.json(merged);
  } catch (error) {
    res.status(500).json({ error: "Failed to merge exams" });
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

    const percentage = (score / totalMarks) * 100;
    const result = percentage >= 40 ? "Pass" : "Fail";
    const status = "Completed";
    
    user.exams.push(
      {
        subject,
        score,
        totalMarks,
        markedAnswers : answers,
        result,
        status
      }
    );

    await user.save();

    res.status(201).json({ message: "Result saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error saving result" });
  }
});

// ******************************************************************************************************************************

router.get("/exam-analytics", verifyToken, async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.user.email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const exams = user.exams;
    const totalExams = exams.length;
    const totalScore = exams.reduce((acc, exam) => acc + exam.score, 0);
    const avgScore = totalExams ? (totalScore / totalExams).toFixed(2) : 0;
    const passRate = totalExams ? ((exams.filter(exam => exam.score >= exam.totalMarks/2).length / totalExams) * 100).toFixed(2) : 0;
    const completionRate = totalExams ? 100 : 0;

    res.json({
      email : req.user.email,
      totalExams,
      avgScore,
      passRate,
      completionRate,
      recentExams: exams.slice(-5).reverse(), // Get last 5 exams
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching analytics" });
  }
});

// ******************************************************************************************************************************

router.get('/questions', async (req, res) => {
  try {
    const exams = await Exam.find({}, 'subject questions'); // Fetch subject and questions only
    console.log("exams data from mongo inside /questions api", exams);
    const formattedData = {};

    exams.forEach((exam) => {
      if (!formattedData[exam.subject]) {
        formattedData[exam.subject] = [];
      }

      exam.questions.forEach((q) => {
        formattedData[exam.subject].push({
          question: q.question,
          options: q.options,
          answer: q.correctAnswer,
        });
      });
    });

    console.log("Formatted Data is here -> ", formattedData);

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching questions from DB:", error);
    res.status(500).json({ error: "Error fetching questions from database" });
  }
});

// ******************************************************************************************************************************

router.get("/exam-result/:subject", verifyToken, async (req, res) => {
  try{
    const {subject} = req.params;

    const user = await Users.findOne({email : req.user.email});
    if (!user) return res.status(404).json({ message: "User not found" });

    const reqdSubject = user.exams.find((exam) => exam.subject === subject);
    const reqdSubjectExam = await Exam.findOne({subject});

    const {score, markedAnswers} = reqdSubject;
    const {questions} = reqdSubjectExam;
    const quesAndans = questions.map((q) => {
      return {
        question : q.question,
        correctAnswer : q.correctAnswer,
        markedAnswer : markedAnswers.get(q.question) // As markedAnswers is a Map and not a JS object, we use get() method to access the key's value
      }
    });
    
    res.json({score, quesAndans});

    console.log("/exam-result/:subject markedAnswers data", markedAnswers);
    console.log("/exam-result/:subject quesAndans data", quesAndans);

  } catch(err) {
    console.error("Error fetching exam result:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

module.exports = router;