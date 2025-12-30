const express = require("express");
const router = express.Router();

const {
  createProject,
  getAllProjects,
  getProjectById,
  submitProject,
  reviewSubmission,
  deactivateProject,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");
const upload = require("../utils/multer");

router.post("/", protect, checkAccess("ADMIN"), createProject);

router.get("/", protect, checkAccess("ADMIN"), getAllProjects);

router.put(
  "/:projectId/deactivate",
  protect,
  checkAccess("ADMIN"),
  deactivateProject
);

router.get("/:projectId", protect, getProjectById);

router.post(
  "/:projectId/submit",
  protect,
  checkAccess("STUDENT"),
  upload.single("projectSubmission"),
  submitProject
);

router.put(
  "/:projectId/review/:submissionId",
  protect,
  checkAccess("TRAINER", "ADMIN"),
  reviewSubmission
);

module.exports = router;
