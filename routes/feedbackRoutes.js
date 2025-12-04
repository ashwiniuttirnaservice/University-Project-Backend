const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const {
  createFeedback,
  getAllFeedback,
  getFeedbackByCourse,
  getFeedbackByBatch,
  getFeedbackByStudent,
} = require("../controllers/feedbackController");

router.post("/", upload.single("profile"), createFeedback);

router.get("/", getAllFeedback);

router.get("/:courseId", getFeedbackByCourse);
router.get("/:batchId", getFeedbackByBatch);
router.get("/:studentId", getFeedbackByStudent);
module.exports = router;
