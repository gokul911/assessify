const { buildSchema } = require("graphql");

const typeDefs = buildSchema(`
  type Exam {
    score: Int
    totalMarks: Int
    subject : String
  }
  
  type ExamStatus {
    name : String,
    status : String
  }

  type ExamAnalytics {
    email: String
    totalExams: Int
    avgScore: Float
    passRate: Float
    completionRate: Float
    recentExams: [Exam]
  }

  type Query {
    examAnalytics: ExamAnalytics
    exams : [ExamStatus]
  }
  
`);

module.exports = typeDefs;
