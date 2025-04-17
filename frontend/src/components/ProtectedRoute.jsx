import { Navigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verify authentication from the backend
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
          withCredentials: true, // Send cookies for auth
        });
        setIsAuthenticated(response.status === 200);
      } catch (error) {
        setIsAuthenticated(false); // Not authenticated
      }
    };
    checkAuth();
  }, []);

  // Wait until authentication status is determined
  if (isAuthenticated === null) {
    return <div style={{ textAlign: "center" }}>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
