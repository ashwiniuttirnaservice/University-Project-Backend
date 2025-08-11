const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getAllCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

// POST /api/courses
router.post("/", createCourse);

// GET /api/courses
router.get("/", getAllCourses);
router.get("/all", getAllCourse);
// GET /api/courses/:id
router.get("/:id", getCourseById);

// PUT /api/courses/:id
router.put("/:id", updateCourse);

// DELETE /api/courses/:id
router.delete("/:id", deleteCourse);

module.exports = router;
