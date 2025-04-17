import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { NavLink, Outlet } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
                    withCredentials: true, // Send cookies for auth
                });

                // Ensure valid response data
                const userData = response.data;
                if (userData && userData.email) {
                    setIsAuthenticated(true); // User is authenticated
                    console.log("User role:", userData.role);
                    setIsAdmin(userData.role === "admin"); // Check if admin
                }
            } catch (error) {
                console.error("Authentication check failed:", error.response?.data || error.message);
            }
        };
        checkAuth();
    }, []);

    // Function to handle logout
    const handleLogout = async () => {
        try {
            await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/logout`,
            {},
            { withCredentials: true } // Send cookies to server
            );
            
            setIsAuthenticated(false); // Update state

            navigate("/");

        } catch (error) {
            console.error("Logout failed:", error.response?.data || error.message);
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="logo" onClick={() => navigate("/")}>
                    <i className="fas fa-chart-line"></i>
                    <span>Assessify</span>
                </div>
                <ul className="nav-links">
                    <li><NavLink to={isAdmin ? "/admin" : "/"} end>Home</NavLink></li>
                    <li><NavLink to={isAdmin ? "/admin/dashboard" : "/dashboard"}>Dashboard</NavLink></li>
                    <li><NavLink to={isAdmin ? "/admin/exams" : "/exams"}>Exams</NavLink></li>
                    <li><NavLink to={isAdmin ? "/admin/analytics" : "/analytics"}>Analytics</NavLink></li>
                    <li><NavLink to={isAdmin ? "/admin/profile" : "/profile"}><i className="fas fa-user-circle"></i></NavLink></li>
                </ul>
                {isAuthenticated ? (
                    <div className="auth-buttons">
                        <NavLink className="auth-button" onClick={handleLogout}>Logout</NavLink>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <NavLink to="/login" className="auth-button">Login</NavLink>
                        <NavLink to="/signup" className="auth-button">Signup</NavLink>
                    </div>
                )}
            </nav>
            <Outlet/>
        </>
    );
};

export default Navbar;
