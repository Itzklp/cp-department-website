// controllers/dashboardController.js
const Publication = require('../models/publicationModel');
const Conference = require('../models/conferenceModel');
// You can import other models here like Project, Patent, etc.

exports.getFacultyDashboardData = async (req, res) => {
  try {
    // req.user is populated by your protect middleware
    const facultyId = req.user.facultyProfile; // Or req.user._id depending on your userModel
    const facultyName = req.user.name; 

    // 1. Fetch data concurrently
    const [publications, conferences] = await Promise.all([
      Publication.find({ authors: facultyId }).sort({ year: -1 }),
      Conference.find({ authors: facultyName }) // Assuming conferences store string names
    ]);

    // 2. Helper function to group data by year
    const groupByYear = (items, yearField) => {
      return items.reduce((acc, item) => {
        // Handle variations in year/date fields
        let itemYear = item[yearField];
        if (!itemYear) {
            itemYear = "Unknown Year";
        } else if (typeof itemYear === 'string' && itemYear.includes('-')) {
            itemYear = itemYear.split('-')[0]; // Extract year if it's a full date string like YYYY-MM-DD
        }

        if (!acc[itemYear]) {
          acc[itemYear] = [];
        }
        acc[itemYear].push(item);
        return acc;
      }, {});
    };

    // 3. Format the final response object
    const dashboardData = {
      Publications: groupByYear(publications, 'year'),
      Conferences: groupByYear(conferences, 'date'), 
      // Add others as you go: Projects: groupByYear(projects, 'year'),
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