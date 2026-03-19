// controllers/dashboardController.js
const Publication = require('../models/publicationModel');
const Project = require('../models/projectsModel');
const Conference = require('../models/conferenceModel');
const PhdThesis = require('../models/phdThesisModel');
const Patent = require('../models/patentModel');
const PublishedBook = require('../models/publishedBooksModel');
const DepartmentEvent = require('../models/departmentEventsModel');
const InvitedTalk = require('../models/invitedTalkModel');
const FacultyAward = require('../models/facultyAwardModel');

exports.getFacultyDashboardData = async (req, res) => {
  try {
    // Extract the references based on your auth middleware
    const facultyId = req.user.facultyProfile; // ObjectId for refs like authors, projectPI
    const facultyName = req.user.name; // String for schemas that store the literal name

    // Fetch all data concurrently as flat arrays. 
    // We add .catch(() => []) to ensure that if one table is missing/empty, it doesn't break the whole dashboard.
    const [
      publications,
      projects,
      conferences,
      phdThesis,
      patents,
      books,
      events,
      talks,
      awards
    ] = await Promise.all([
      Publication.find({ authors: facultyId }).sort({ year: -1 }).catch(() => []),
      Project.find({ $or: [{ projectPI: facultyId }, { projectCoPI: facultyId }] }).sort({ dateSanctioned: -1 }).catch(() => []),
      Conference.find({ $or: [{ authors: facultyId }, { authors: facultyName }] }).catch(() => []),
      PhdThesis.find({ $or: [{ supervisor: facultyId }, { supervisor: facultyName }] }).catch(() => []),
      Patent.find({ $or: [{ inventors: facultyId }, { inventors: facultyName }] }).catch(() => []),
      PublishedBook.find({ authors: facultyId }).catch(() => []),
      DepartmentEvent.find({ coordinators: facultyId }).catch(() => []),
      InvitedTalk.find({ speaker: facultyName }).catch(() => []),
      FacultyAward.find({ awardee: facultyId }).catch(() => [])
    ]);

    // Format the response EXACTLY as the new React frontend expects it
    const dashboardData = {
      publications: publications || [],
      projects: projects || [],
      conferences: conferences || [],
      phdThesis: phdThesis || [],
      patents: patents || [],
      books: books || [],
      events: events || [],
      talks: talks || [],
      awards: awards || []
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ success: false, message: "Server Error fetching dashboard" });
  }
};