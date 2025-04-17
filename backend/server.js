const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
require('dotenv').config();

const app = express();
const cookieParser = require("cookie-parser");

// GraphQL
const { graphqlHTTP } = require("express-graphql");
const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// REST
const {router:authRoutes, verifyToken} = require("./routes/auth");
const userRoutes = require("./routes/user");

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

app.use(
  "/graphql",
  verifyToken, // Sets req.user
  graphqlHTTP((req, res) => ({
    schema,
    graphiql: true,
    context: { req }, // req.user is now available here
  }))
);

app.listen(port, () => {
  console.log(`Server starting at http://localhost:${port}`);
});