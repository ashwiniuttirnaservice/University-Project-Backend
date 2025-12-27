const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/attendance", reportController.attendanceReport);
router.get("/attendance/download", reportController.downloadAttendanceExcel);

router.get("/prerequisite", reportController.prerequisiteReport);
router.get(
  "/prerequisite/download",
  reportController.downloadPrerequisiteExcel
);

router.get("/pre-assessment", reportController.preAssessmentReport);
router.get(
  "/pre-assessment/download",
  reportController.downloadPreAssessmentExcel
);

router.get("/assignment", reportController.assignmentReport);
router.get("/assignment/download", reportController.downloadAssignmentExcel);

router.get("/feedback", reportController.feedbackReport);
router.get("/feedback/download", reportController.downloadFeedbackExcel);

module.exports = router;
