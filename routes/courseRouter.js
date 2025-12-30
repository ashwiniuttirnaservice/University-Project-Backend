const express = require("express");
const courseRouter = express.Router();

const upload = require("../utils/multer");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");
const roleFilter = require("../middleware/roleFilter");
const {
  createCourse,
  cloneCourse,
  getAllCourse,
  getAllCourse1,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

courseRouter.post(
  "/",
  protect,
  checkAccess("course", "create"),
  upload.fields([
    { name: "courseImage", maxCount: 1 },
    { name: "trainingPlan", maxCount: 1 },
  ]),

  createCourse
);

courseRouter.post(
  "/:id/clone",
  protect,
  checkAccess("course", "create"),
  cloneCourse
);

courseRouter.get(
  "/all",
  protect,
  roleFilter,
  checkAccess("course", "read"),
  getAllCourse
);

courseRouter.get("/all-course", getAllCourse1);

courseRouter.get("/:id", getCourseById);

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
