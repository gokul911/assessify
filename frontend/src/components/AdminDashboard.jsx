import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState([]);
  const [filteredAnalytics, setFilteredAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const COLORS = ["#38bdf8", "#e2e8f0"]; 

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/all-student-analytics`,
          { withCredentials: true }
        );
        setAnalytics(res.data.analytics);
        setFilteredAnalytics(res.data.analytics); // Initialize filtered data
      } catch (err) {
        console.error("Error fetching student analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const generateReport = (studentEmail) => {
    // Simulate report generation/download
    alert(`Generating report for ${studentEmail}`);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);

    const filtered = analytics.filter(student => {
      const username = student.email.split("@")[0].toLowerCase();
      return username.includes(value);
    });
    setFilteredAnalytics(filtered);
  };

  const topPerformers = [...filteredAnalytics]
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-dashboard">
      <h1>Student Analytics Overview</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search student by username..."
          value={searchQuery}
          onChange={handleSearch}
          style={{
            padding: "8px 12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            width: "300px"
          }}
        />
      </div>

      <section className="chart-section">
        <h2>Top 5 Performers</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topPerformers} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis
              dataKey="email"
              tickFormatter={(email) => email.split("@")[0]}
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              axisLine={{ stroke: "#475569" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              axisLine={{ stroke: "#475569" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "14px"
              }}
              itemStyle={{ color: "#38bdf8" }}
              cursor={{ fill: "transparent" }} // removes white hover box
            />
            <Bar
              dataKey="avgScore"
              fill="#38bdf8"
              barSize={30}
              radius={[4, 4, 0, 0]} // Rounded corners
              activeBar={{ fill: "#38bdf8" }} // No change on hover
            />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="table-section">
        <h2>All Students</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Total Exams</th>
              <th>Avg Score</th>
              <th>Pass Rate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* {analytics.map((student, index) => (
              <tr key={index}>
                <td>{student.email}</td>
                <td>{student.totalExams}</td>
                <td>{student.avgScore}%</td>
                <td>{student.passRate}%</td>
                <td>
                  <button
                    onClick={() => navigate(`/dashboard/${encodeURIComponent(student.email)}`)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))} */}
            {filteredAnalytics.map((student, index) => (
              <React.Fragment key={index}>
                <tr className="student-row">
                  <td>{student.email}</td>
                  <td>{student.totalExams}</td>
                  <td>{student.avgScore}%</td>
                  <td>{student.passRate}%</td>
                  <td>
                    <button
                      className="view-details-btn"
                      onClick={() => toggleExpand(index)}
                    >
                      {expandedIndex === index ? "Hide Scores" : "View Scores"}
                    </button>
                  </td>
                </tr>
                {expandedIndex === index && (
                  <tr className="expanded-row">
                    <td colSpan="5">
                      <div className="student-detail-card">
                        {student.subjectScores && student.subjectScores.length > 0 ? (
                          <div className="subject-cards-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px" , padding : "10px"}}>
                            {student.subjectScores.map((subjectScore, idx) => {
                              const obtained = subjectScore.score;
                              const total = subjectScore.totalMarks;
                              // const percentage = (obtained / total) * 100;
                          
                              const pieData = [
                                { name: "Obtained", value: obtained },
                                { name: "Remaining", value: total - obtained }
                              ];
                          
                              return (
                                <div key={idx} className="subject-card" style={{
                                  borderRadius: "12px",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                  textAlign: "center"
                                }}>
                                  <h4>{subjectScore.subject}</h4>
                          
                                  <PieChart width={120} height={120}>
                                    <Pie
                                      data={pieData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={35}
                                      outerRadius={50}
                                      startAngle={90}
                                      endAngle={-270}
                                      dataKey="value"
                                    >
                                      {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                  </PieChart>
                          
                                  <p style={{ marginTop: "8px", fontWeight: "bold" }}>Marks : {obtained} / {total}</p>
                                </div>
                              );
                            })}
                        </div>
                        ) : (
                          <p>No subject scores available.</p>
                        )}

                        {/* <button
                          className="generate-report-btn"
                          onClick={() => generateReport(student.email)}
                          style={{ marginTop: "10px" }}
                        >
                          Generate Report
                        </button> */}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;