const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
require('dotenv').config();

const app = express();
const cookieParser = require("cookie-parser");

// REST
const {router:authRoutes, verifyToken} = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

// Connecting Express with MongoDB ->
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Allowing cross-origin requests for your React client ->
// Enable CORS with specific origin and credentials

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost'], // "http://localhost" is for frontend Docker container
  credentials: true, // Allow cookies and other credentials
}));
app.use(cookieParser());

app.use(express.json()); // to parse the input data body coming from client
app.use(express.urlencoded( {extended : true} ));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Server starting at http://localhost:${port}`);
});