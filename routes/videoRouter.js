const express = require("express");
const {
  createVideoLecture,
  getAllVideoLectures,
  getVideoLectureById,
  updateVideoLecture,
  deleteVideoLecture,
} = require("../controllers/videoController");

const router = express.Router();

router.post("/", createVideoLecture);

router.get("/", getAllVideoLectures);

router.get("/:id", getVideoLectureById);

router.put("/:id", updateVideoLecture);

router.delete("/:id", deleteVideoLecture);

module.exports = router;
