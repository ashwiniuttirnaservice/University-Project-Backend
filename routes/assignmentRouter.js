const express = require("express");
const assignmentRouter = express.Router();
const assignmentController = require("../controllers/assignmentController");
const upload = require("../utils/multer");
const checkAccess = require("../middleware/checkAccess");
const { protect } = require("../middleware/authMiddleware");
const { validateAssignment } = require("../validations/assignmentValidation");
const validateRequest = require("../validations/validateMiddleware");
assignmentRouter.post(
  "/create",
  protect,
  checkAccess("assignment", "create"),
  upload.array("fileUrl", 10),
  validateRequest(validateAssignment),
  assignmentController.createAssignments
);

assignmentRouter.post(
  "/create/single",
  protect,
  checkAccess("assignment", "create"),
  validateRequest(validateAssignment),
  upload.single("fileUrl"),
  assignmentController.createAssignments
);

assignmentRouter.put(
  "/:id",
  protect,
  checkAccess("assignment", "update"),
  validateRequest(validateAssignment),
  upload.single("fileUrl"),
  assignmentController.updateAssignment
);

assignmentRouter.delete(
  "/:id",
  protect,
  checkAccess("assignment", "delete"),
  assignmentController.deleteAssignment
);

assignmentRouter.get(
  "/",
  protect,
  checkAccess("assignment", "read"),
  assignmentController.getAllAssignments
);

assignmentRouter.get(
  "/:id",
  protect,
  checkAccess("assignment", "read"),
  assignmentController.getAssignmentById
);

assignmentRouter.get(
  "/course/:courseId",
  protect,
  checkAccess("assignment", "read"),
  assignmentController.getAssignmentsByCourse
);

assignmentRouter.get(
  "/:id/submissions",
  protect,
  checkAccess("assignment", "read"),
  assignmentController.getAssignmentSubmissions
);

assignmentRouter.post(
  "/grade",
  protect,
  upload.array("mistakePhotos", 10),
  checkAccess("assignment", "update"),
  validateRequest(validateAssignment),
  assignmentController.gradeAssignment
);

assignmentRouter.get(
  "/:assignmentId/submissions/:studentId/download",

  assignmentController.downloadSubmissionLogExcelByStudent
);

assignmentRouter.post(
  "/submit",
  protect,
  checkAccess("assignment", "create"),
  validateRequest(validateAssignment),
  upload.array("submissionFile", 10),
  assignmentController.submitAssignment
);

assignmentRouter.post(
  "/resubmit",
  upload.array("files", 10),
  validateRequest(validateAssignment),
  assignmentController.resubmitAssignment
);

module.exports = assignmentRouter;
