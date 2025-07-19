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

  const [scheduledFrom, setScheduledFrom] = useState(null);
  const [scheduledTo, setScheduledTo] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  const TAB_WARNING_LIMIT = 3;
  const FACE_VIOLATION_LIMIT = 10;
  
  const checkExamStatus = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/individual-student-exams`,
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

  const fetchScheduledTimes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/all-exams`,
        { withCredentials: true }
      );
  
      const exam = response.data.find((exam) => exam.subject.trim() === subject);
      if (exam) {
        setScheduledFrom(new Date(exam.scheduledFrom));
        setScheduledTo(new Date(exam.scheduledTo));
      }

    } catch (error) {
      console.error("Error fetching scheduled times:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkExamStatus();  // Check if completed
      await fetchScheduledTimes(); // Fetch scheduledFrom and scheduledTo
    };
    init();
  }, [subject]);

  // Fetch questions
  useEffect(() => {
    if (isCompleted) return;

    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/questions`, {
          withCredentials: true,
        });
        console.log("Fetched MCQ Questions -> ", response.data);
        setMcqQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [isCompleted]);

  // // Timer countdown
  // useEffect(() => {
  //   if (isCompleted || isLocked) return;
  //   const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
  //   return () => clearInterval(timer);
  // }, [isCompleted, isLocked]);

  // Submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !isCompleted) {
      handleSubmit(isLocked); // Pass `true` if locked (score 0)
    }
  }, [timeLeft]);


  // Updating the timer according to scheduledFrom and To
  useEffect(() => {
    if (!scheduledFrom || !scheduledTo || isCompleted || isLocked) return;

    const timer = setInterval(() => {
      const now = new Date();

      if (now >= scheduledFrom && now <= scheduledTo) {
        setHasStarted(true);
        const remainingSeconds = Math.floor((scheduledTo - now) / 1000);
        setTimeLeft(remainingSeconds);
      } else if (now > scheduledTo) {
        if (!isCompleted) {
          handleSubmit(); // Auto submit when time is over
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [scheduledFrom, scheduledTo, isLocked, isCompleted]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
  
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswer = (question, answer) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  // Handle test submission
  const handleSubmit = async (forceZeroScore = false, providedTotalMarks = null) => {
    const questions = mcqQuestions[subject] || [];
    const totalMarks = providedTotalMarks ?? questions.length;
  
    let score = 0;
    if (!forceZeroScore) {
      score = questions.reduce((acc, q) => {
        return acc + (answers[q.question]?.trim() === q.answer?.trim() ? 1 : 0);
      }, 0);
    }
  
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/exam-results`,
        { subject, score, totalMarks, answers },
        { withCredentials: true }
      );
      setIsCompleted(true);
      navigate("/exams");
    } catch (error) {
      console.error("Error submitting results:", error);
    }
  };

  // Handle face violations
  const [pendingLock, setPendingLock] = useState(false);

  useEffect(() => {
    if (pendingLock && mcqQuestions[subject]) {
      const totalMarks = mcqQuestions[subject].length;
      alert("🚫 Test locked due to face detection violations!");
      setIsLocked(true);
      handleSubmit(true, totalMarks);
      setPendingLock(false);
    }
  }, [pendingLock, mcqQuestions, subject]);

  const handleViolationUpdate = (noFace, multiFace) => {
    if (!hasStarted) return; // 🚫 Ignore updates before exam starts

    setNoFaceCount(noFace);
    setMultiFaceCount(multiFace);
  
    if (noFace >= FACE_VIOLATION_LIMIT || multiFace >= FACE_VIOLATION_LIMIT) {
      setPendingLock(true);
    }
  };

  // Handle tab switch & visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!hasStarted) return; // 🚫 Ignore tab switches before exam starts

      if (document.hidden && !isCompleted && !isLocked) {
        const newCount = tabWarnings + 1;
        setTabWarnings(newCount);
        alert(`⚠️ Tab switch detected! Warning ${newCount}/${TAB_WARNING_LIMIT}`);

        if (newCount >= TAB_WARNING_LIMIT) {
          alert("🚫 Test locked due to multiple tab switches!");
          setIsLocked(true);
          handleSubmit(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [tabWarnings, hasStarted, isCompleted, isLocked]);

  if (loading) return <p>Loading...</p>;

  return (
    <>

      {hasStarted && <FaceDetection handleViolationUpdate={handleViolationUpdate} />}

      <div className="exam-container">
        <h2>{subject} Exam</h2>
        
        {!hasStarted ? (
          !(scheduledFrom instanceof Date && !isNaN(scheduledFrom.valueOf())) ? (
            <p className="waiting-message">Exam isn't scheduled yet.</p>
          ) : (
            <p className="waiting-message">
              Exam will start at 
              <strong>
                  {scheduledFrom
                    ? scheduledFrom.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                    : ''}
              </strong>
            </p>
          )
        ) : isCompleted ? (
          <p>You have already completed this exam. You cannot retake it.</p>
        ) : isLocked ? (
          <p>🚫 This test has been locked due to rule violations.</p>
        ) : (
          <>
            <p className="timer">
              Time Left: <strong>{formatTime(timeLeft)}</strong> seconds
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
