import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import '../styles/Login.css';

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    const handleSignup = async (e) => {
      e.preventDefault(); // Prevent the default form submission
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/signup`,
          {email, password },
          { withCredentials: true }
        );
        alert("Signup successful");
        if (response.status === 201) {
          navigate("/login"); // Redirect to login page
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Signup failed");
      }
    };

  return (
    <div className='login-body'>

      <div className="login-container">
        <div className="login-header">
          <h1>Exam Platform Signup</h1>
          <p>Secure access to your examination portal</p>
        </div>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="username">Student Email</label>
            <input 
              type="email" 
              id="username" 
              placeholder="Enter your email id" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required />
          </div>
          <button type="submit" className="button">Signup</button>
          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
