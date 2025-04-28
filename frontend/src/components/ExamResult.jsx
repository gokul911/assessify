import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ExamResult.css";

const ExamResult = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [mcqQuestions, setMcqQuestions] = useState({});
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/questions`,
          { withCredentials: true }
        );

        setMcqQuestions(response.data);
        console.log("ExamResult.jsx /questions mcqQuestions data -> ", response.data);

      } catch (error) {
        console.error("Error fetching questions for exam result :", error);
      }
    }
    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchAnswers = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/exam-result/${subject}`,
        { withCredentials: true }
      );

      setAnswers(response.data.markedAnswers);
      setScore(response.data.score);
    }
    fetchAnswers();
  }, [subject])

  return (
      <div className="exam-results">
          <h3>Exam Result - {subject}</h3>
          <p>
            <strong>Score:</strong> {score} / {mcqQuestions[subject]?.length || 0}
          </p>

          {mcqQuestions[subject]?.map((q, index) => {
              const userAnswer = answers[q.question] || "Not Answered";
              const isCorrect = userAnswer === q.answer;

              return (
                  <div key={index} className={`result-item ${isCorrect ? "correct" : "incorrect"}`}>
                      <p><strong>Q{index+1}:</strong> {q.question}</p>
                      <p><strong>Your Answer:</strong> {userAnswer}</p>
                      <p><strong>Correct Answer:</strong> {q.answer}</p>
                  </div>
              );
          })}

          <button className="btn-back" onClick={() => navigate("/exams")}>Go Back</button>
      </div>
  );
};

export default ExamResult;