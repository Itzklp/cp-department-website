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
const authRoute = require('./routes/authRoute');


// App init
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use('/api/v1/test', require('./routes/testRoute'));

// Auth Route
app.use('/api/v1/auth', require('./routes/authRoute') );

// Faculty Route
app.use('/api/v1/faculty', require('./routes/facultyRoute'));

// Project Route
app.use('/api/v1/project', require('./routes/projectsRoute'));

// Publication Route
app.use('/api/v1/publication', require('./routes/publicationRoute'));

//Conference Route
app.use('/api/v1/conference', require('./routes/conferenceRoute'));

//Published Book Route
app.use('/api/v1/publishedBook', require('./routes/publishedBooksRoute'));

//Department Events Route
app.use('/api/v1/departmentEvent', require('./routes/departmentEventsRoute'));

//Invited Talk Route
app.use("/api/v1/invitedTalk", require("./routes/invitedTalkRoute")); 

//Department Talk Route
app.use("/api/v1/departmentTalk", require("./routes/departmentTalkRoute"));

//Faculty Award Route
app.use("/api/v1/facultyAward", require("./routes/facultyAwardRoute")); 

//Patents Route
app.use("/api/v1/patent", require("./routes/patentRoute"));

//PhD Thesis Route
app.use("/api/v1/phdThesis", require("./routes/phdThesisRoute"));

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
