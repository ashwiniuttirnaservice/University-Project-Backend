const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const upload = require("../utils/multer");

router.post(
  "/create",
  upload.array("fileUrl", 10),
  assignmentController.createAssignments
);

router.post(
  "/create/single",
  upload.single("fileUrl"),
  assignmentController.createAssignments
);

router.post(
  "/submit",
  upload.single("submissionFile"),
  assignmentController.submitAssignment
);

router.get("/course/:courseId", assignmentController.getAssignmentsByCourse);
router.get("/", assignmentController.getAllAssignments);
router.get("/:id", assignmentController.getAssignmentById);

router.put(
  "/:id",
  upload.single("fileUrl"),
  assignmentController.updateAssignment
);
router.delete("/:id", assignmentController.deleteAssignment);

module.exports = router;
