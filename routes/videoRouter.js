const express = require("express");
const {
  createVideoLecture,
  getAllVideoLectures,
  getVideoLectureById,
  updateVideoLecture,
  deleteVideoLecture,
} = require("../controllers/videoController");

const router = express.Router();

// Create
router.post("/", createVideoLecture);

// Get All
router.get("/", getAllVideoLectures);

// Get by ID
router.get("/:id", getVideoLectureById);

// Update
router.put("/:id", updateVideoLecture);

// Delete
router.delete("/:id", deleteVideoLecture);

module.exports = router;
