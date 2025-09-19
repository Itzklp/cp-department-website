const Publication = require("../models/publicationModel");

// Add new publication
const addPublication = async (req, res) => {
  try {
    const { title, authors, year, journal, volume, issue, pages, doi } = req.body;

    if (!title || !authors || authors.length === 0 || !year || !journal) {
      return res.status(400).json({ error: "Title, authors, year, and journal are required." });
    }

    const newPublication = new Publication({
      title,
      authors,
      year,
      journal,
      volume,
      issue,
      pages,
      doi,
    });

    await newPublication.save();
    res.status(201).json(newPublication);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all publications (optional filter by professorId via query param)
const getPublications = async (req, res) => {
  try {
    const { professorId } = req.query;

    let filter = {};
    if (professorId) {
      filter = { authors: professorId };
    }

    const publications = await Publication.find(filter)
      .populate("authors", "firstName lastName email designation");

    res.json(publications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get publications by professor (route param)
const getPublicationsByProfessor = async (req, res) => {
  try {
    const { professorId } = req.params;

    const publications = await Publication.find({ authors: professorId })
      .populate("authors", "firstName lastName email designation");

    res.json(publications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search publications by title
const searchPublicationsByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ error: "Title query is required" });
    }

    const publications = await Publication.find({
      title: { $regex: title, $options: "i" }, // case-insensitive search
    }).populate("authors", "firstName lastName email designation");

    res.json(publications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update publication
const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Publication.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("authors", "firstName lastName email designation");

    if (!updated) {
      return res.status(404).json({ error: "Publication not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete publication
const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Publication.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Publication not found" });
    }

    res.json({ message: "Publication deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addPublication,
  getPublications,
  getPublicationsByProfessor,
  searchPublicationsByTitle,
  updatePublication,
  deletePublication,
};
