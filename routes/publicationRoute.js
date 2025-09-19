const express = require("express");
const {
  addPublication,
  getPublications,
  getPublicationsByProfessor,
  searchPublicationsByTitle,
  updatePublication,
  deletePublication,
} = require("../controllers/publicationController");

const router = express.Router();

// Add new publication
router.post("/", addPublication);

// Get all publications OR filter by professorId (query param)
router.get("/", getPublications);

// Get publications by professorId (route param)
router.get("/professor/:professorId", getPublicationsByProfessor);

// Search publications by title
router.get("/search", searchPublicationsByTitle);

// Update publication by ID
router.put("/:id", updatePublication);

// Delete publication by ID
router.delete("/:id", deletePublication);

module.exports = router;
