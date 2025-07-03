import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ExamResult.css";

const ExamResult = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchAnswers = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/exam-result/${subject}`,
        { withCredentials: true }
      );

      setQuestions(response.data.quesAndans);
      setScore(response.data.score);
    }
    fetchAnswers();
  }, [subject])

  return (
      <div className="exam-results">
          <h3>Exam Result - {subject}</h3>
          <p>
            <strong>Score:</strong> {score} / {questions?.length || 0}
          </p>

          {
            questions?.map((q, index) => {
              const userAnswer = q.markedAnswer || "Not Answered";
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                  <div key={index} className={`result-item ${isCorrect ? "correct" : "incorrect"}`}>
                      <p><strong>Q{index+1}:</strong> {q.question}</p>
                      <p><strong>Your Answer:</strong> {userAnswer}</p>
                      <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                  </div>
              );
            })
          }

          <button className="btn-back" onClick={() => navigate("/exams")}>Go Back</button>
      </div>
  );
};

export default ExamResult;