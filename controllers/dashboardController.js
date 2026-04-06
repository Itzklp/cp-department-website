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
    // Updated to accept arrays of fields so we can check multiple ObjectId or String fields
    const buildFilter = (objectIdFields = [], stringFields = []) => {
      if (isAdminOrHOD) return {};
      
      const conditions = [];
      
      // Push conditions for any ObjectId fields
      if (safeFacultyId && objectIdFields.length > 0) {
        objectIdFields.forEach(field => conditions.push({ [field]: safeFacultyId }));
      }
      
      // Push conditions for any String fields (using the Regex)
      if (nameRegex && stringFields.length > 0) {
        stringFields.forEach(field => conditions.push({ [field]: nameRegex }));
      }

      return conditions.length > 0 ? { $or: conditions } : { _id: null };
    };

    const fetchSafe = async (name, promise) => {
      try { return await promise; } 
      catch (err) { 
        console.error(`[Dashboard] Error fetching ${name}:`, err.message); 
        return []; 
      }
    };

    // 3. Fetch Data with Correct Field Routing based on actual Model schemas
    let [
      publications, projects, conferences, phdThesis, 
      patents, books, events, talks, awards
    ] = await Promise.all([
      // authors = ObjectId[], otherAuthors = String[]
      fetchSafe('Publications', Publication.find(buildFilter(['authors'], ['otherAuthors'])).lean()),
      
      // projectPI & projectCoPI = ObjectId, collaborator = String
      fetchSafe('Projects', Project.find(buildFilter(['projectPI', 'projectCoPI'], ['collaborator'])).lean()),
      
      fetchSafe('Conferences', Conference.find(buildFilter(['authors'], ['otherAuthors'])).lean()),
      fetchSafe('phdThesis', PhdThesis.find(buildFilter(['supervisor'], ['otherSupervisors'])).lean()),
      fetchSafe('Patents', Patent.find(buildFilter(['authors'], ['otherAuthors'])).lean()),
      fetchSafe('Books', PublishedBook.find(buildFilter(['author'], ['otherAuthors'])).lean()),
      fetchSafe('Events', DepartmentEvent.find(buildFilter(['coordinators'], ['otherCoordinators'])).lean()),
      fetchSafe('Talks', InvitedTalk.find(buildFilter(['speaker'], ['otherSpeakers'])).lean()),
      
      // facultyName = String (No ObjectId reference exists in the FacultyAward model)
      fetchSafe('Awards', FacultyAward.find(buildFilter([], ['facultyName'])).lean())
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