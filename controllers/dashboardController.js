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

// exports.getFacultyDashboardData = async (req, res) => {
//   try {
//     const user = req.user;
//     let facultyId = user.facultyProfile;

//     // 1. Aggressive Identity Resolution
//     if (!facultyId) {
//       const faculty = await Faculty.findOne({ email: user.email });
//       if (faculty) facultyId = faculty._id;
//     }

//     const safeFacultyId = facultyId || '000000000000000000000000'; // Prevent CastErrors
//     const isAdmin = user.role === 'admin';

//     // Extract just the First Name for highly relaxed string matching
//     // (e.g., if user.name is "Dr. John Doe", we search for "John")
//     const nameParts = (user.name || "").replace(/dr\.|prof\./i, '').trim().split(' ');
//     const firstName = nameParts[0] || "";
//     const nameRegex = new RegExp(firstName, "i");

//     // 2. Query Builder (Shows everything if Admin, otherwise filters strictly)
//     const getFilter = (orConditions) => isAdmin ? {} : { $or: orConditions };

//     // 3. Safe Fetch Wrapper using .lean() to prevent Mongoose schema crash on legacy data
//     const fetchSafe = async (modelName, queryPromise) => {
//       try {
//         return await queryPromise;
//       } catch (error) {
//         console.error(`[Dashboard] Failed fetching ${modelName}:`, error.message);
//         return [];
//       }
//     };

//     const [
//       publications, projects, conferences, phdThesis, patents, books, events, talks, awards
//     ] = await Promise.all([
//       fetchSafe('Publications', Publication.find(getFilter([
//         { authors: safeFacultyId },
//         { otherAuthors: { $regex: nameRegex } }
//       ])).lean()),

//       fetchSafe('Projects', Project.find(getFilter([
//         { projectPI: safeFacultyId },
//         { projectCoPI: safeFacultyId },
//         { collaborator: { $regex: nameRegex } }
//       ])).lean()),

//       fetchSafe('Conferences', Conference.find(getFilter([
//         { authors: safeFacultyId }, { authors: nameRegex }
//       ])).lean()),

//       fetchSafe('PhdThesis', PhdThesis.find(getFilter([
//         { supervisor: safeFacultyId }, { supervisor: nameRegex }
//       ])).lean()),

//       fetchSafe('Patents', Patent.find(getFilter([
//         { authors: safeFacultyId }, { authors: nameRegex }
//       ])).lean()),

//       fetchSafe('Books', PublishedBook.find(getFilter([
//         { author: safeFacultyId }, { author: nameRegex }
//       ])).lean()),

//       fetchSafe('Events', DepartmentEvent.find(getFilter([
//         { coordinators: safeFacultyId }, { coordinators: nameRegex }
//       ])).lean()),

//       fetchSafe('Talks', InvitedTalk.find(getFilter([
//         { speaker: safeFacultyId }, { speaker: nameRegex }
//       ])).lean()),

//       fetchSafe('Awards', FacultyAward.find(getFilter([
//         { facultyName: safeFacultyId }, { facultyName: nameRegex }
//       ])).lean())
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         publications: publications || [],
//         projects: projects || [],
//         conferences: conferences || [],
//         phdThesis: phdThesis || [],
//         patents: patents || [],
//         books: books || [],
//         events: events || [],
//         talks: talks || [],
//         awards: awards || []
//       }
//     });

//   } catch (error) {
//     console.error("Dashboard master fetch error:", error);
//     res.status(500).json({ success: false, message: "Server Error fetching dashboard" });
//   }
// };

const getFacultyDashboardData = async (req, res) => {
  try {
    const user = req.user;
    const safeFacultyId = user.facultyProfile ? user.facultyProfile.toString() : null;
    const safeName = user.name ? user.name.trim() : "";
    const nameRegex = safeName ? new RegExp(`^${safeName}$`, 'i') : null;

    // 🔥 1. Check for Admin OR Head of Department
    let isHOD = false;
    if (safeFacultyId) {
      const facProfile = await Faculty.findById(safeFacultyId).select('designation').lean();
      if (facProfile && facProfile.designation === 'Head of Department') {
        isHOD = true;
      }
    }
    const isAdminOrHOD = user.role === 'admin' || isHOD;

    // Filter logic: Admins and HODs get {} (Everything)
    const getFilter = (conditions) => {
      if (isAdminOrHOD) return {}; 
      const validConditions = conditions.filter(c => Object.values(c)[0] != null);
      return validConditions.length > 0 ? { $or: validConditions } : { _id: null };
    };

    const fetchSafe = async (name, promise) => {
      try { return await promise; } 
      catch (err) { console.error(`Error fetching ${name}:`, err); return []; }
    };

    let [
      publications, projects, conferences, phdThesis, 
      patents, books, events, talks, awards
    ] = await Promise.all([
      fetchSafe('Publications', Publication.find(getFilter([{ authors: safeFacultyId }, { authors: nameRegex }])).lean()),
      fetchSafe('Projects', Project.find(getFilter([{ collaborator: safeFacultyId }, { collaborator: nameRegex }])).lean()),
      fetchSafe('Conferences', Conference.find(getFilter([{ authors: safeFacultyId }, { authors: nameRegex }])).lean()),
      fetchSafe('phdThesis', PhdThesis.find(getFilter([{ supervisor: safeFacultyId }, { supervisor: nameRegex }])).lean()),
      fetchSafe('Patents', Patent.find(getFilter([{ authors: safeFacultyId }, { authors: nameRegex }])).lean()),
      fetchSafe('Books', PublishedBook.find(getFilter([{ author: safeFacultyId }, { author: nameRegex }])).lean()),
      fetchSafe('Events', DepartmentEvent.find(getFilter([{ coordinators: safeFacultyId }, { coordinators: nameRegex }])).lean()),
      fetchSafe('Talks', InvitedTalk.find(getFilter([{ speaker: safeFacultyId }, { speaker: nameRegex }])).lean()),
      fetchSafe('Awards', FacultyAward.find(getFilter([{ facultyName: safeFacultyId }, { facultyName: nameRegex }])).lean())
    ]);

    // Build ID-to-Name Dictionary
    const allFaculty = await Faculty.find().select('firstName lastName name').lean();
    const facultyMap = {};
    allFaculty.forEach(f => {
       const fName = f.firstName || '';
       const lName = f.lastName || '';
       let fullName = `${fName} ${lName}`.trim();
       if (!fullName) fullName = f.name || "Unknown Faculty";
       facultyMap[f._id.toString()] = fullName;
    });

    // ID Replacer
    const rawData = { publications, projects, conferences, phdThesis, patents, books, events, talks, awards };
    const cleanDataString = JSON.stringify(rawData, (key, value) => {
       if (key === '_id') return value;
       if (typeof value === 'string' && facultyMap[value]) return facultyMap[value];
       return value;
    });

    res.status(200).json({
      success: true,
      isAdminOrHOD: isAdminOrHOD, // 🔥 Pass elevated privilege flag to frontend
      data: JSON.parse(cleanDataString)
    });
    
  } catch (err) {
    console.error("Dashboard API Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};

module.exports = { getFacultyDashboardData };