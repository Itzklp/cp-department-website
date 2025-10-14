const Publication = require("../models/publicationModel");
const Faculty = require("../models/facultyModels");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const addPublication = async (req, res) => {
  try {
    const { title, authors, year, journal, volume, issue, pages, doi } = req.body;

    if (!title || !authors || authors.length === 0 || !year || !journal) {
      return res.status(400).json({ error: "Title, authors, year, and journal are required." });
    }

    const facultyAuthors = [];
    const otherAuthors = [];

    for (const name of authors) {
      const faculty = await Faculty.findOne({
        $or: [
          { fullName: { $regex: new RegExp(`^${name}$`, "i") } },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: new RegExp(`^${name}$`, "i"),
              },
            },
          },
        ],
      });

      if (faculty) facultyAuthors.push(faculty._id);
      else otherAuthors.push(name);
    }

    const newPublication = new Publication({
      title,
      authors: facultyAuthors,
      otherAuthors,
      year,
      journal,
      volume,
      issue,
      pages,
      doi,
    });

    await newPublication.save();
    const populated = await newPublication.populate("authors", "firstName lastName email designation");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Error adding publication:", err);
    res.status(500).json({ error: err.message });
  }
};

const getPublications = async (req, res) => {
  try {
    const { professorId } = req.query;
    let filter = {};
    if (professorId) filter = { authors: professorId };

    const publications = await Publication.find(filter)
      .populate("authors", "firstName lastName email designation");

    res.json(publications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

const searchPublicationsByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ error: "Title query is required" });
    }

    const publications = await Publication.find({
      title: { $regex: title, $options: "i" },
    }).populate("authors", "firstName lastName email designation");

    res.json(publications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

const bulkUploadPublications = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "..", req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const inserted = [];

    for (const row of sheetData) {
      const title = row["Title"]?.trim();
      const authorsStr = row["Authors"]?.trim();
      const year = parseInt(row["Year"]);
      const journal = row["Journal"]?.trim();
      const volume = row["Volume"] || "";
      const issue = row["Issue"] || "";
      const pages = row["Pages"] || "";
      const doi = row["DOI"] || "";

      if (!title || !authorsStr || !year || !journal) continue;

      const authorNames = authorsStr
        .split(/,|&|and/gi)
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const facultyAuthors = [];
      const otherAuthors = [];

      for (const name of authorNames) {
        const faculty = await Faculty.findOne({
          $or: [
            { fullName: { $regex: new RegExp(`^${name}$`, "i") } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$firstName", " ", "$lastName"] },
                  regex: new RegExp(`^${name}$`, "i"),
                },
              },
            },
          ],
        });

        if (faculty) facultyAuthors.push(faculty._id);
        else otherAuthors.push(name);
      }

      const pub = new Publication({
        title,
        authors: facultyAuthors,
        otherAuthors,
        year,
        journal,
        volume,
        issue,
        pages,
        doi,
      });

      await pub.save();
      inserted.push(pub);
    }

    fs.unlinkSync(filePath);

    res.status(201).json({
      message: `${inserted.length} publications uploaded successfully`,
      publications: inserted,
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
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
  bulkUploadPublications, 
};
