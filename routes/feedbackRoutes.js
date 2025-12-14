const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const {
  createFeedback,
  getAllFeedback,
  getAllFeedback1,
  getFeedbackByCourse,
  getFeedbackByBatch,
  getFeedbackByStudent,
} = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");
const roleFilter = require("../middleware/roleFilter");

router.post("/", upload.single("profile"), createFeedback);

router.get(
  "/",
  protect,
  roleFilter,
  checkAccess("feedback", "read"),
  getAllFeedback
);
router.get("/all", getAllFeedback1);

router.get("/:courseId", getFeedbackByCourse);
router.get("/:batchId", getFeedbackByBatch);
router.get("/:studentId", getFeedbackByStudent);
module.exports = router;
