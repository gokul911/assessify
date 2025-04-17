import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/TimedExam.css';
import FaceDetection from "./FaceDetection";

const TimedExam = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [mcqQuestions, setMcqQuestions] = useState({});
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noFaceCount, setNoFaceCount] = useState(0);
  const [multiFaceCount, setMultiFaceCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

  const TAB_WARNING_LIMIT = 3;
  const FACE_VIOLATION_LIMIT = 10;

  // Fullscreen entry
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    setShowFullscreenPrompt(false);
  };

  // Initial fetch: exam status
  useEffect(() => {
    const checkExamStatus = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/exams`,
          { withCredentials: true }
        );

        if (response.data.some((exam) => exam.name === subject && exam.status === "Completed")) {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error("Error fetching exam status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkExamStatus();
  }, [subject]);

  // Fetch questions
  useEffect(() => {
    if (isCompleted) return;

    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/questions`, {
          withCredentials: true,
        });
        setMcqQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [isCompleted]);

  // Timer countdown
  useEffect(() => {
    if (isCompleted || isLocked) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isCompleted, isLocked]);

  // Submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !isCompleted) {
      handleSubmit(isLocked); // Pass `true` if locked (score 0)
    }
  }, [timeLeft]);

  // Handle answer selection
  const handleAnswer = (question, answer) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  // Handle test submission
  const handleSubmit = async (forceZeroScore = false) => {
    let score = 0;
    let totalMarks = mcqQuestions[subject]?.length || 0;

    if (!forceZeroScore && mcqQuestions[subject]) {
      mcqQuestions[subject].forEach((q) => {
        if (answers[q.question]?.trim() === q.answer?.trim()) score++;
      });
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/exam-results`,
        { subject, score: forceZeroScore ? 0 : score, totalMarks, answers },
        { withCredentials: true }
      );
      setIsCompleted(true);
      navigate("/exams");
    } catch (error) {
      console.error("Error submitting results:", error);
    }
  };

  // Handle face violations
  const handleViolationUpdate = (noFace, multiFace) => {
    setNoFaceCount(noFace);
    setMultiFaceCount(multiFace);

    if (noFace >= FACE_VIOLATION_LIMIT || multiFace >= FACE_VIOLATION_LIMIT) {
      alert("🚫 Test locked due to face detection violations!");
      setIsLocked(true);
      handleSubmit(true); // force submit with 0 score
    }
  };

  // Handle tab switch & visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isCompleted && !isLocked) {
        const newCount = tabWarnings + 1;
        setTabWarnings(newCount);
        alert(`⚠️ Tab switch detected! Warning ${newCount}/${TAB_WARNING_LIMIT}`);

        if (newCount >= TAB_WARNING_LIMIT) {
          alert("🚫 Test locked due to multiple tab switches!");
          setIsLocked(true);
          handleSubmit(true);
        }
      } else if (!document.hidden && !isCompleted && !isLocked) {
        setShowFullscreenPrompt(true); // Ask to re-enter fullscreen
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [tabWarnings, isCompleted, isLocked]);

  // Enter fullscreen on load
  useEffect(() => {
    if (!isCompleted && !isLocked) {
      enterFullscreen();
    }
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {showFullscreenPrompt && (
        <div className="fullscreen-prompt">
          <p>You returned to the test. Click below to re-enter full screen.</p>
          <button onClick={enterFullscreen}>Return to Full Screen</button>
        </div>
      )}

      <FaceDetection handleViolationUpdate={handleViolationUpdate} />

      <div className="exam-container">
        <h2>{subject} Exam</h2>

        {isCompleted ? (
          <p>You have already completed this exam. You cannot retake it.</p>
        ) : isLocked ? (
          <p>🚫 This test has been locked due to rule violations.</p>
        ) : (
          <>
            <p className="timer">
              Time Left: <strong>{timeLeft}</strong> seconds
            </p>

            {mcqQuestions[subject]?.map((q, index) => (
              <div key={index}>
                <p>Q{index + 1}) {q.question}</p>
                {q.options.map((opt, i) => (
                  <label key={i}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={opt}
                      onChange={() => handleAnswer(q.question, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ))}

            <button
              className="timed-submit-btn"
              onClick={() => handleSubmit()}
              disabled={isCompleted || isLocked}
            >
              Submit
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default TimedExam;
