import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminExamCreation from "./AdminExamCreation"; 
import toast, { Toaster } from "react-hot-toast"; 
import "../styles/AdminExamsDisplay.css"; 

const AdminExamsDisplay = () => {
  const [exams, setExams] = useState([]);
  const [questionsData, setQuestionsData] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleExamId, setScheduleExamId] = useState(null);
  const [scheduleData, setScheduleData] = useState({ from: "", to: "" });


  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/all-exams`, { withCredentials: true });
      setExams(response.data);
  
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams.");
    }
  };

  const handleRefreshAllExamStatuses = async () => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/update-all-exam-status`, {}, { withCredentials: true });
      
      // Trigger toast notifications for each exam
      // response.data.exams.forEach(exam => {
      //   toast.success(`Exam ${exam.subject} status updated to ${exam.status}`);
      // });
      toast.success("All Exam statuses updated")
      fetchExams();
  
    } catch (error) {
      console.error("Error updating all exam statuses:", error);
      toast.error("Failed to refresh exam statuses.");
    }
  };
    
  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/questions`, { withCredentials: true });
      setQuestionsData(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions.");
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/delete-exam/${id}`, { withCredentials: true });
      toast.success("Exam deleted successfully!");
      fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam.");
    }
  };

  const handleScheduleExam = (examId) => {
    setScheduleExamId(examId);       // store which exam we are scheduling
    setShowScheduleModal(true);      // open the schedule modal
  };
  
  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setScheduleExamId(null);
    setScheduleData({ from: "", to: "" });
  };
  
  const handleScheduleSubmit = async () => {
    try {
      const fromUTC = new Date(scheduleData.from).toISOString();
      const toUTC = new Date(scheduleData.to).toISOString();
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/schedule-exam/${scheduleExamId}`,
        {
          from : fromUTC,
          to : toUTC
        },
        { withCredentials: true }
      );
      toast.success("Exam scheduled successfully!");
      fetchExams();
      closeScheduleModal();
    } catch (error) {
      console.error("Error scheduling exam:", error);
      toast.error("Failed to schedule exam.");
    }
  };  

  const handleViewQuestions = (subject) => {
    setSelectedSubject(subject);
    setShowQuestionsModal(true);
  };

  const closeQuestionsModal = () => {
    setShowQuestionsModal(false);
    setSelectedSubject(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  return (
    <div className={`admin-page ${showCreateModal || showQuestionsModal ? "blurred" : ""}`}>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Exams List */}
      <div className="exams-container">
        <div className="header">
          <h1>Manage Exams</h1>
          <p>View, schedule, or delete exams</p>
          {/* Refresh All Exams Status Button */}
          {
            exams.length !== 0 && (
              <button className="btn-refresh-all" onClick={handleRefreshAllExamStatuses}>
                Refresh Status
              </button>
            )
          }
        </div>
        

        <div className="subjects-grid">
          {exams.length === 0 && 
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '20px', marginTop: '20px' }}>
                No exams available. Create a new one to get started.
              </h1>
              <p style={{paddingBottom : '110px', cursor: 'pointer' }}>
                Click the + button to create an exam.
              </p>
            </div>
          }


          {exams.map((exam, index) => (
            <div key={index} className="subject-card">
              <div className="subject-header">
                <h2 className="subject-title">{exam.subject}</h2>
                <span className={exam.status === "Completed" ? "status-completed" : "status-pending"}>
                  {exam.status}
                </span>
              </div>
              <div className="progress-bar">
                  <div className="progress" style={{ width: exam.status === "Completed" ? "100%" : "0%" }}></div>
              </div>
              <div className="admin-actions">
                <button className="btn-view" onClick={() => handleViewQuestions(exam.subject)}>
                  View Questions
                </button>

                {exam.scheduledFrom && exam.scheduledTo ? (
                  <div className="scheduled-time">
                    <p>Scheduled:</p>
                    <p>{new Date(exam.scheduledFrom).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} - {new Date(exam.scheduledTo).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                  </div>
                ) : (
                  <button className="btn-view" onClick={() => handleScheduleExam(exam._id)}>
                    Schedule Exam
                  </button>
                )}

                <button className="btn-delete" onClick={() => handleDeleteExam(exam._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Create Button */}
      <button className="floating-button" onClick={() => setShowCreateModal(true)}>
        +
        <span className="button-tooltip">Create Exam</span>
      </button>

      {/* Modal for Create Exam */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Exam</h2>
              <button className="modal-close" onClick={closeCreateModal}>×</button>
            </div>
            <div className="modal-body">
              <AdminExamCreation 
                fetchExams={fetchExams} 
                fetchQuestions={fetchQuestions} 
                closeModal={closeCreateModal} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal for View Questions */}
      {showQuestionsModal && (
        <div className="modal-overlay" onClick={closeQuestionsModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSubject} - Questions</h2>
              <button className="modal-close" onClick={closeQuestionsModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="questions-list">
                {questionsData[selectedSubject] ? (
                  questionsData[selectedSubject].map((q, idx) => (
                    <div key={idx} className="question-item">
                      <h4>Q{idx + 1}: {q.question}</h4>
                      <ul>
                        {q.options.map((option, oidx) => (
                          <li key={oidx}>{option}</li>
                        ))}
                      </ul>
                      <p><strong>Answer:</strong> {q.answer}</p>
                    </div>
                  ))
                ) : (
                  <p>No questions found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Schedule Exams */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={closeScheduleModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Exam</h2>
              <button className="modal-close" onClick={closeScheduleModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="schedule-form">
                <label>From (Date & Time):</label>
                <input 
                  type="datetime-local" 
                  value={scheduleData.from} 
                  onChange={(e) => setScheduleData({ ...scheduleData, from: e.target.value })}
                />
                <label>To (Date & Time):</label>
                <input 
                  type="datetime-local" 
                  value={scheduleData.to} 
                  onChange={(e) => setScheduleData({ ...scheduleData, to: e.target.value })}
                />
                <button className="btn-schedule-submit" onClick={handleScheduleSubmit}>
                  Schedule Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminExamsDisplay;
