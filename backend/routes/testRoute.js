const express = require("express");
const { testController } = require("../controllers/testController");

const router = express.Router();

// When you hit GET /api/v1/test/
router.get("/", testController);

module.exports = router;
