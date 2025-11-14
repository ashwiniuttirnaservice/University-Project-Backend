const express = require("express");
const router = express.Router();

const {
  createCourse,
  cloneCourse,
  getAllCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

router.post("/", createCourse);
router.post("/:id/clone", cloneCourse);

router.get("/all", getAllCourse);

router.get("/:id", getCourseById);

router.put("/:id", updateCourse);

router.delete("/:id", deleteCourse);

module.exports = router;
