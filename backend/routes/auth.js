const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/user');

const router = express.Router();
console.log("auth routes loaded");

const verifyToken = (req, res, next) => {
    // Get the token from cookies
    const token = req.cookies.token;
    console.log("Token: ",token);

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    // Verify the token using the secret
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Attach the decoded user data to the request object
        req.user = decoded;

        next(); // Proceed to the next middleware or route handler
    });
};

// Signup route
router.post('/signup', async (req, res) => {
    console.log("Sign up post request received");
    console.log(req.body);
    const { email, password } = req.body;
    try {
        const existingUsers = await Users.findOne({ email });
        if (existingUsers) return res.status(400).json({ message: "User already exists" });
        await Users.create({ email, password });
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    
    console.log("received request");
    const { email, password } = req.body;
    console.log(req.body);

    try {
        const user = await Users.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

       
        
        const token = jwt.sign({ email : user.email, role : user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
        

        // Send token in an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,  // Prevents JavaScript access (Security)
            secure: true,    // Ensures cookies are sent only over HTTPS (Required on Render)
            sameSite: 'None', // Allow cross-site cookies (If your frontend (Vercel) and backend (Render) are on different domains)
            maxAge: 3600000, // 1 hour expiration
        });

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure : true,
        sameSite : 'None'
    });
    res.status(200).json({ message: "Logged out successfully" });
});

// Protected route example
router.get('/verify', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
        res.status(200).json({ message: "Protected data", email: decoded.email, role : decoded.role });
    });
}); 

module.exports = {router, verifyToken};
 