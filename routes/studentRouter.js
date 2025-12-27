const express = require("express");
const studentRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");
const upload = require("../utils/multer");

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
  // protect,
  // checkAccess("student", "create"),
  registerCandidate
);

studentRouter.post(
  "/register",
  // protect,
  // checkAccess("student", "create"),
  upload.fields([
    { name: "profilePhotoStudent", maxCount: 1 },
    { name: "idProofStudent", maxCount: 1 },
  ]),
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
  protect,
  checkAccess("student", "read"),
  getStudentById
);

studentRouter.put(
  "/update/:studentId",

  upload.fields([
    { name: "profilePhotoStudent", maxCount: 1 },
    { name: "idProofStudent", maxCount: 1 },
  ]),
  updateStudent
);

studentRouter.delete(
  "/delete/:studentId",
  protect,
  checkAccess("student", "delete"),
  deleteStudent
);

module.exports = studentRouter;
