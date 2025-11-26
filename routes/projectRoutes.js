const express = require("express");
const projectRouter = express.Router();

const upload = require("../middleware/multer");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const projectCtrl = require("../controllers/project.controller");

projectRouter.post(
  "/",
  protect,
  checkAccess("project", "create"),
  projectCtrl.createProject
);

projectRouter.get(
  "/",
  protect,
  checkAccess("project", "read"),
  projectCtrl.getAllProjects
);

projectRouter.get(
  "/:projectId",
  protect,
  checkAccess("project", "read"),
  projectCtrl.getProjectById
);

projectRouter.post(
  "/:projectId/assign-student",
  protect,
  checkAccess("project", "update"),
  projectCtrl.assignStudent
);

projectRouter.post(
  "/:projectId/assign-trainer",
  protect,
  checkAccess("project", "update"),
  projectCtrl.assignTrainer
);

projectRouter.post(
  "/:projectId/submit",
  protect,
  checkAccess("project", "create"),
  upload.single("zipFile"),
  projectCtrl.submitProject
);

projectRouter.put(
  "/:projectId/review/:submissionId",
  protect,
  checkAccess("project", "update"),
  projectCtrl.reviewSubmission
);

module.exports = projectRouter;
