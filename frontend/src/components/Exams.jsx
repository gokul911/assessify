import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Exams.css";

const Exams = () => {
    const [subjects, setSubjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/exams`, {withCredentials : true});
                setSubjects(response.data);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        };
        fetchSubjects();
    }, []);

    const handleStartExam = (subject, status) => {
        if (status === "Completed") {
            navigate(`/exam-result/${subject}`);
        } else {
            navigate(`/exam/${subject}`);
        }
    };

    return (
        <div className="exams-container">
            <div className="header">
                <h1>Exam Portal</h1>
                <p>Manage your subject exams</p>
            </div>

            <div className="subjects-grid">
                {subjects.map((subject, index) => (
                    <div key={index} className="subject-card">
                        <div className="subject-header">
                            <h2 className="subject-title">{subject.name}</h2>
                            <span className={subject.status === "Completed" ? "status-completed" : "status-pending"}>
                                {subject.status}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress" style={{ width: subject.status === "Completed" ? "100%" : "0%" }}></div>
                        </div>
                        <button className="btn-view" onClick={() => handleStartExam(subject.name,subject.status)}>
                            {subject.status === "Completed" ? "View Results" : "Start Exam"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Exams;
