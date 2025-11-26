const express = require("express");
const courseRouter = express.Router();

const upload = require("../utils/multer");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const {
  createCourse,
  cloneCourse,
  getAllCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

courseRouter.post(
  "/",
  protect,
  checkAccess("course", "create"),
  upload.single("trainingPlan"),
  createCourse
);

courseRouter.post(
  "/:id/clone",
  protect,
  checkAccess("course", "create"),
  cloneCourse
);

courseRouter.get("/all", protect, checkAccess("course", "read"), getAllCourse);

courseRouter.get("/:id", protect, checkAccess("course", "read"), getCourseById);

courseRouter.put(
  "/:id",
  protect,
  checkAccess("course", "update"),
  upload.single("trainingPlan"),
  updateCourse
);

courseRouter.delete(
  "/:id",
  protect,
  checkAccess("course", "delete"),
  deleteCourse
);

module.exports = courseRouter;
