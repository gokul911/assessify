const express = require('express');
const router = express.Router();
const Users = require("../models/user");
const Exam = require("../models/exam");
const axios = require("axios");
const {verifyToken} = require("./auth.js");

console.log("admin routes loaded");

router.get('/all-exams', async (req, res) => {
  try {
    const exams = await Exam.find({}, 'subject status scheduledFrom scheduledTo'); 
    res.json(exams);
    console.log("Exams being sent from /api/admin/all-exams",exams);
  } catch (error) {
    console.error("Error fetching all exams:", error);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

// ******************************************************************************************************************************

router.put('/update-all-exam-status', verifyToken, async (req, res) => {
  try {
    // 1. Fetch all exams
    const exams = await Exam.find(); // Assuming all exams should be checked

    if (exams.length === 0) {
      return res.status(400).json({ message: "No exams found." });
    }

    // 2. Iterate through all exams and check the status for each
    const updatedExamsStatus = [];

    // 3. Find all users who attempted this exam
    const users = await Users.find({role : "user"});
    console.log("users inside /api/admin/update-all-exam-status", users);
    
    for (const exam of exams) {

      // 4. Check if all users have 'Completed' status for this exam
      const allCompleted = users.every(user => {
        const examData = user.exams?.find(e => e.subject === exam.subject);
        return examData && examData.status === "Completed";
      });
      console.log("allCompleted status for ", exam.subject, " inside /api/admin/update-all-exam-status", allCompleted);

      // 5. Update the exam status accordingly
      if (allCompleted) {
        exam.status = "Completed";
        await exam.save(); // Save the updated status
        updatedExamsStatus.push({ subject: exam.subject, status: "Completed" });
      } else {
        updatedExamsStatus.push({ subject: exam.subject, status: "Pending" });
      }
    }

    // 6. Return the result for each exam
    return res.json({
      message: "Exam statuses updated successfully.",
      exams: updatedExamsStatus,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// ******************************************************************************************************************************

router.get("/all-student-analytics", async (req, res) => {
  try {
    const users = await Users.find();

    const analytics = users.filter(user => user.role === "user").map(user => {
      const totalExams = user.exams.length;
      const totalScore = user.exams.reduce((acc, e) => acc + e.score, 0);
      const avgScore = totalExams ? (totalScore / totalExams).toFixed(2) : 0;
      const passRate = totalExams
        ? ((user.exams.filter(e => e.score >= e.totalMarks / 2).length / totalExams) * 100).toFixed(2)
        : 0;

      return {
        email: user.email,
        totalExams,
        avgScore,
        passRate,
        subjectScores: user.exams.map(exam => ({
          subject: exam.subject,
          score: exam.score ?? "N/A",
          totalMarks : exam.totalMarks
        }))
      };
    });

    res.json({ analytics });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student analytics" });
  }
});

// ******************************************************************************************************************************

const API_KEY = process.env.GOOGLE_API_KEY;

// Function to fetch sheet data
const getSheetData = async (sheetName, spreadSheetId) => {
  const RANGE = `${sheetName}!A2:G`;  // Dynamically set the sheet name in range
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values/${RANGE}?key=${API_KEY}`
    );
    return response.data.values;  // Returns rows of data from the sheet
  } catch (error) {
    console.error("Error fetching data from Google Sheets: ", error);
    throw error;
  }
};

router.post("/create-exam", verifyToken, async (req, res) => {
  try {
    const { subject, spreadsheetId, sheetName } = req.body;
    const user = await Users.findOne({ email : req.user.email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });

    // Fetch questions from the specified sheet
    const questionsData = await getSheetData(sheetName,spreadsheetId);

    // Map the Google Sheets data to the question format you need
    const questions = questionsData.map((row) => {
      return {
        question: row[0], // Assuming question text is in column A
        options: row.slice(1, 5), // Assuming options are in columns B-E
        correctAnswer: row[5], // Assuming the correct answer is in column F
      };
    });

    console.log("Questions -> ", questions);

    // Save the exam to the database
    const newExam = new Exam({
      subject,
      spreadsheetId,
      sheetName,
      questions,
      createdBy: user._id, // Assuming the admin is the logged-in user
    });

    await newExam.save();

    res.status(201).json({ message: 'Exam created successfully', exam: newExam });
  } catch (err) {
    console.error("Error creating exam:", err);
    res.status(500).json({ message: 'Error creating exam' });
  }
});

// ******************************************************************************************************************************

router.delete('/delete-exam/:id', async (req, res) => {
  try {
    const examId = req.params.id;
    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    res.status(500).json({ error: "Failed to delete exam" });
  }
});

// ******************************************************************************************************************************

router.put('/schedule-exam/:id', async (req, res) => {
  try {
    const { from, to } = req.body;
    const examId = req.params.id;

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      { scheduledFrom : from, scheduledTo : to },
      { new: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    res.status(200).json({ message: "Exam scheduled successfully!", exam: updatedExam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while scheduling exam." });
  }
});


module.exports = router;