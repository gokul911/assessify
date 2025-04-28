// import React, { useState } from "react";
// import axios from "axios";
// import "../styles/AdminExamCreation.css";

// const AdminExamCreation = ({ fetchExams }) => {
//   const [spreadsheetId, setSpreadsheetId] = useState("");
//   const [sheetName, setSheetName] = useState("");
//   const [subject, setSubject] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/create-exam`,
//         {
//           subject,
//           spreadsheetId,
//           sheetName,
//         },
//         { withCredentials: true }
//       );
//       alert("Exam created successfully");
      
//       // after successful creation, refresh the exam list!
//       fetchExams();

//       // Clear input fields
//       setSubject("");
//       setSpreadsheetId("");
//       setSheetName("");
//     } catch (error) {
//       console.error("Error creating exam:", error);
//       alert("Error creating exam");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="exam-body">
//       <div className="exam-form-container">
//         <h1 className="form-title">Create Exam</h1>
//         <form className="exam-form" onSubmit={handleSubmit}>
//           <div className="exam-form-group">
//             <label className="exam-form-label">Subject:</label>
//             <input
//               type="text"
//               className="form-input"
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//               required
//             />
//           </div>
//           <div className="exam-form-group">
//             <label className="exam-form-label">Spreadsheet ID:</label>
//             <input
//               type="text"
//               className="form-input"
//               value={spreadsheetId}
//               onChange={(e) => setSpreadsheetId(e.target.value)}
//               required
//             />
//           </div>
//           <div className="exam-form-group">
//             <label className="exam-form-label">Sheet Name:</label>
//             <input
//               type="text"
//               className="form-input"
//               value={sheetName}
//               onChange={(e) => setSheetName(e.target.value)}
//               required
//             />
//           </div>
//           <button className="submit-button" type="submit" disabled={loading}>
//             {loading ? "Creating..." : "Create Exam"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AdminExamCreation;

import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/AdminExamCreation.css";

const AdminExamCreation = ({ fetchExams, fetchQuestions, closeModal }) => {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/create-exam`, 
        {
          subject,
          spreadsheetId,
          sheetName,
        },
        { withCredentials: true }
      );
      toast.success("Exam created successfully!");
      fetchExams();
      fetchQuestions();
      closeModal(); 
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Failed to create exam.");
    }

    setLoading(false);
  };

  return (
    <div className="exam-body">
      <div className="exam-form-container">
        <form className="exam-form" onSubmit={handleSubmit}>
          <div className="exam-form-group">
            <label className="exam-form-label">Subject:</label>
            <input
              type="text"
              placeholder="Enter Subject Name"
              className="form-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="exam-form-group">
            <label className="exam-form-label">Spreadsheet ID:</label>
            <input
              type="text"
              placeholder="Copy the ID from your Google Sheets URL (between /d/ and /edit)" 
              className="form-input"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              required
            />
          </div>
          <div className="exam-form-group">
            <label className="exam-form-label">Sheet Name:</label>
            <input
              type="text"
              placeholder="Enter Sheet Name like Sheet1, Sheet2 etc."
              className="form-input"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              required
            />
          </div>
          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Exam"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminExamCreation;
