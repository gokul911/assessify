import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Exams from './components/Exams';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './components/Signup';
import TimedExam from './components/TimedExam';
import ExamResult from './components/ExamResult';
import AdminDashboard from './components/AdminDashboard';
// import AdminExamCreation from './components/AdminExamCreation';
import AdminExamsDisplay from './components/AdminExamsDisplay';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/signup' element={<Signup/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/exam/:subject' element={<ProtectedRoute><TimedExam/></ProtectedRoute>}></Route>
        <Route path='/exam-result/:subject' element={<ProtectedRoute><ExamResult/></ProtectedRoute>}></Route>

        <Route element={<Navbar/>}>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/admin' element={<Home/>}></Route>

          <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}></Route>
          <Route path='/admin/dashboard' element={<ProtectedRoute><AdminDashboard/></ProtectedRoute>}></Route>

          <Route path='/exams' element={<ProtectedRoute><Exams/></ProtectedRoute>}></Route>
          <Route path='/admin/exams' element={<ProtectedRoute><AdminExamsDisplay/></ProtectedRoute>}></Route>

        </Route>
      </Routes>
    </Router>
  )
}

export default App
