const express = require("express");
const {
  registerCandidate,
  registerStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const upload = require("../utils/multer");

const studentRouter = express.Router();

// @route POST /api/students/candidate
// @desc Register a new candidate (minimal info)
studentRouter.post("/candidate", registerCandidate);

// @route POST /api/students/register
// @desc Register a new student with file upload
studentRouter.post(
  "/register",
  upload.fields([
    { name: "profilePhotoStudent", maxCount: 1 },
    { name: "idProofStudent", maxCount: 1 },
  ]),
  registerStudent
);

// @route GET /api/students/all
// @desc Get all students
studentRouter.get("/all", getAllStudents);

// @route GET /api/students/:studentId
// @desc Get a single student by ID
studentRouter.get("/:studentId", getStudentById);

// @route PUT /api/students/update/:studentId
// @desc Update student information with optional file uploads
studentRouter.put(
  "/update/:studentId",
  upload.fields([
    { name: "profilePhotoStudent", maxCount: 1 },
    { name: "idProofStudent", maxCount: 1 },
  ]),
  updateStudent
);

// @route DELETE /api/students/delete/:studentId
// @desc Delete a student by ID
studentRouter.delete("/delete/:studentId", deleteStudent);

module.exports = studentRouter;
