import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    const handleLogin = async (e) => {
      e.preventDefault(); // Prevent form submission refresh
      
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/login`,
          { email, password },
          { withCredentials: true }
        );

        navigate("/");
  
        if (response.status === 200) {
          const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
            withCredentials: true,
          });
    
          const user = userResponse.data;
          if (user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      } catch (err) {
        console.error("Axios Error:", err);
        if (err.response) {
          console.error("Response Data:", err.response.data);
          console.error("Response Status:", err.response.status);
          alert(err.response?.data?.message || 'Login failed');
          if(err.response.status === 404) navigate("/signup");
        } else if (err.request) {
            console.error("No response received:", err.request);
        } else {
            console.error("Request setup error:", err.message);
        }
      }
    };
    
  return (
    <div className='login-body'>
      <div className="login-container">
        <div className="login-header">
          <h1>Exam Platform Login</h1>
          <p>Secure access to your examination portal</p>
        </div>
        <form onSubmit={handleLogin}>
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
          <button type="submit" className="button">Login</button>
          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
