const Users = require("../models/user");

const resolvers = {
  Query: {
    examAnalytics: async function (parent, args, context) {
      try {

        const { req } = context;
    
        if (!req.user || !req.user.email) {
          throw new Error("Unauthorized");
        }
    
        const user = await Users.findOne({ email: req.user.email });
    
        if (!user) {
          throw new Error("User not found");
        }

        const exams = user.exams;
        const totalExams = exams.length;
        const totalScore = exams.reduce((acc, exam) => acc + exam.score, 0);
        const avgScore = totalExams ? (totalScore / totalExams).toFixed(2) : 0;
        const passRate = totalExams ? ((exams.filter(exam => exam.score >= exam.totalMarks/2).length / totalExams) * 100).toFixed(2) : 0;
        const completionRate = totalExams ? 100 : 0;
    
        return {
          email: req.user.email,
          totalExams,
          avgScore,
          passRate,
          completionRate,
          recentExams: exams.slice(-5).reverse(),
        };
      } catch (error) {
        console.error("Resolver Error:", error);
        return null;
      }
    },

    exams : async function(parent, args, context) {
      try {
        const { req } = context;

        if (!req.user || !req.user.email) {
          throw new Error("Unauthorized");
        }

        const user = await Users.findOne({ email: req.user.email });
    
        if (!user) throw new Error("User not found" );
    
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
        return updatedSubjects;
    
      } catch (error) {
          throw new Error("Error fetching subjects");
      }
    } 
  },
};

module.exports = resolvers;
