import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/exam-analytics`, { withCredentials: true });
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const generateReport = async () => {
    if (!analytics?.email) {
      alert("User email not available!");
      return;
    }
  
    const username = analytics.email.split("@")[0]; // Extract username
    const pdf = new jsPDF();
  
    // Add Report Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Exam Performance Report", 105, 15, { align: "center" });
  
    // Add Report Metadata
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated for: ${analytics.email}`, 14, 30);
    pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 40);
  
    // Summary Section
    pdf.setFont("helvetica", "bold");
    pdf.text("Performance Summary:", 14, 55);
    pdf.setFont("helvetica", "normal");
  
    pdf.text(`Total Exams Taken: ${analytics?.totalExams || 0}`, 14, 63);
    pdf.text(`Average Score: ${analytics?.avgScore || "0.00"}%`, 14, 69);
    pdf.text(`Pass Rate: ${analytics?.passRate || "0.00"}%`, 14, 75);
    pdf.text(`Completion Rate: ${analytics?.completionRate || "0.00"}%`, 14, 81);
  
    // Table of Recent Exams
    if (analytics?.recentExams?.length) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Recent Exam Scores:", 14, 95);
      pdf.setFont("helvetica", "normal");
  
      const examData = analytics.recentExams.map((exam) => [
        exam.subject,
        `${exam.score}/${exam.totalMarks}`,
        `${((exam.score / exam.totalMarks) * 100).toFixed(2)}%`,
      ]);
  
      autoTable(pdf, {
        startY: 100,
        head: [["Subject", "Score", "Percentage"]],
        body: examData,
        
        theme: "striped", // Alternating row colors for better readability
        styles: { fontSize: 11, textColor: [30, 30, 30] }, // Slightly darker text
        headStyles: { fillColor: [34, 45, 50], textColor: 255, fontStyle: "bold" }, // Dark gray header with white text
        alternateRowStyles: { fillColor: [230, 230, 230] }, // Light gray for alternate rows
      });
    } else {
      pdf.text("No recent exams recorded.", 14, 100);
    }
  
    // Save the PDF
    pdf.save(`${username}_Exam_Report.pdf`);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Exam Analytics</h1>
        <button className="generate-btn" onClick={generateReport}>Generate Report</button>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-title">Total Exams</h3>
          <p className="stat-value">{analytics?.totalExams || 0}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Avg. Score</h3>
          <p className="stat-value">{analytics?.avgScore || "0.00"}%</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Pass Rate</h3>
          <p className="stat-value">{analytics?.passRate || "0.00"}%</p>
        </div>
      </div>

      {/* Performance Overview Section */}
      <div className="analytics-container">
        <div className="main-chart">
          <h3>Overview</h3>
          {analytics?.recentExams.length ? (
            <ResponsiveContainer height={200}>
              <LineChart data={analytics.recentExams}>
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="score" stroke="#2e7d32" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No data available</p>
          )}
        </div>
        
        <div className="side-stats">
          <div className="progress-card">
            <div className="progress-header">
              <span>Pass Rate</span>
              <span>{analytics?.passRate || "0"}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${analytics?.passRate || 0}%` }}></div>
            </div>
          </div>
          <div className="progress-card">
            <div className="progress-header">
              <span>Completion Rate</span>
              <span>{analytics?.completionRate || 0}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${analytics?.completionRate || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-exams">
        <h3>Recent Exam Scores</h3>
        {analytics?.recentExams.length ? (
          analytics.recentExams.map((exam, index) => (
            <div className="exam-item" key={index}>
              <span>{exam.subject}</span>
              <span className="stat-value">{exam.score}/{exam.totalMarks}</span>
            </div>
          ))
        ) : (
          <p>No exams taken yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
