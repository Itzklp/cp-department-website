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
const Faculty = require('../models/facultyModels');

const getFacultyDashboardData = async (req, res) => {
  try {
    const user = req.user;
    const safeFacultyId = user.facultyProfile ? user.facultyProfile.toString() : null;
    const safeName = user.name ? user.name.trim() : "";
    const nameRegex = safeName ? new RegExp(`^${safeName}$`, 'i') : null;

    // 1. Identify Elevated Privileges
    let isHOD = user.role === "hod";
    if (safeFacultyId && !isHOD) {
      const facProfile = await Faculty.findById(safeFacultyId).select('designation').lean();
      if (facProfile && facProfile.designation === 'Head of Department') {
        isHOD = true;
      }
    }
    const isAdminOrHOD = user.role === 'admin' || isHOD;

    // 2. Optimized Filter Logic to prevent CastErrors
    // Separates ObjectId matches from String/Regex matches
    const buildFilter = (objectIdField, stringField) => {
      if (isAdminOrHOD) return {};
      
      const conditions = [];
      if (safeFacultyId && objectIdField) conditions.push({ [objectIdField]: safeFacultyId });
      if (nameRegex && stringField) conditions.push({ [stringField]: nameRegex });

      return conditions.length > 0 ? { $or: conditions } : { _id: null };
    };

    const fetchSafe = async (name, promise) => {
      try { return await promise; } 
      catch (err) { 
        console.error(`[Dashboard] Error fetching ${name}:`, err.message); 
        return []; 
      }
    };

    // 3. Fetch Data with Correct Field Routing
    let [
      publications, projects, conferences, phdThesis, 
      patents, books, events, talks, awards
    ] = await Promise.all([
      fetchSafe('Publications', Publication.find(buildFilter('authors', 'otherAuthors')).lean()),
      fetchSafe('Projects', Project.find(buildFilter('collaborator', 'otherCollaborators')).lean()),
      fetchSafe('Conferences', Conference.find(buildFilter('authors', 'otherAuthors')).lean()),
      fetchSafe('phdThesis', PhdThesis.find(buildFilter('supervisor', 'otherSupervisors')).lean()),
      fetchSafe('Patents', Patent.find(buildFilter('authors', 'otherAuthors')).lean()),
      fetchSafe('Books', PublishedBook.find(buildFilter('author', 'otherAuthors')).lean()),
      fetchSafe('Events', DepartmentEvent.find(buildFilter('coordinators', 'otherCoordinators')).lean()),
      fetchSafe('Talks', InvitedTalk.find(buildFilter('speaker', 'otherSpeakers')).lean()),
      fetchSafe('Awards', FacultyAward.find(buildFilter('facultyName', 'otherFaculty')).lean())
    ]);

    // 4. Build ID-to-Name Dictionary
    const allFaculty = await Faculty.find().select('firstName lastName name').lean();
    const facultyMap = {};
    allFaculty.forEach(f => {
       const fullName = `${f.firstName || ''} ${f.lastName || ''}`.trim() || f.name || "Unknown Faculty";
       facultyMap[f._id.toString()] = fullName;
    });

    // 5. Replace IDs with Names in the response
    const rawData = { publications, projects, conferences, phdThesis, patents, books, events, talks, awards };
    const cleanDataString = JSON.stringify(rawData, (key, value) => {
       if (key === '_id') return value;
       if (typeof value === 'string' && facultyMap[value]) return facultyMap[value];
       return value;
    });

    res.status(200).json({
      success: true,
      isAdminOrHOD: isAdminOrHOD,
      data: JSON.parse(cleanDataString)
    });
    
  } catch (err) {
    console.error("Dashboard API Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};

module.exports = { getFacultyDashboardData };