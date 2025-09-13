// Load environment variables first
const dotenv = require("dotenv");
dotenv.config();
connectDB = require("./config/db");
connectDB();

// Imports
const express = require("express");
const colors = require("colors");
const cors = require("cors");
const morgan = require("morgan");
const { connect } = require("mongoose");


// App init
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use('/api/v1/test', require('./routes/testRoute'));

// Test Route
app.get("/", (req, res) => {
  return res.status(200).send("Hello, World! From Kalp");
});

// Port
const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, () => {
  console.log(
    `🚀 Kalp Server is running on http://localhost:${PORT}`.green.bold
  );
});
