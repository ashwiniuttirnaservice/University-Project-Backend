const express = require("express");
const studentRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");
const upload = require("../utils/multer");

const validateRequest = require("../validations/validateMiddleware.js");
const studentValidationSchema = require("../validations/studentValidation");

const {
  registerCandidate,
  registerStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

studentRouter.post(
  "/candidate",
  validateRequest(studentValidationSchema),
  registerCandidate
);

studentRouter.post(
  "/register",
  upload.fields([
    { name: "profilePhotoStudent", maxCount: 1 },
    { name: "idProofStudent", maxCount: 1 },
  ]),
  validateRequest(studentValidationSchema),
  registerStudent
);

studentRouter.get(
  "/all",
  protect,
  checkAccess("student", "read"),
  getAllStudents
);

studentRouter.get(
  "/:studentId",

  getStudentById
);

studentRouter.put(
  "/update/:studentId",
  upload.fields([
    { name: "profilePhotoStudent", maxCount: 1 },
    { name: "idProofStudent", maxCount: 1 },
  ]),
  validateRequest(studentValidationSchema),
  updateStudent
);

studentRouter.delete(
  "/delete/:studentId",
  protect,
  checkAccess("student", "delete"),
  deleteStudent
);

module.exports = studentRouter;
