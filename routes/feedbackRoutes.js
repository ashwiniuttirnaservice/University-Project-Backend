const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const {
  createFeedback,
  getAllFeedback,
  getFeedbackByCourse,
} = require("../controllers/feedbackController");

// ⭐ Single profile file upload
router.post("/", upload.single("profile"), createFeedback);

// Get all feedback
router.get("/", getAllFeedback);

// Get feedback by courseId
router.get("/:courseId", getFeedbackByCourse);

module.exports = router;
