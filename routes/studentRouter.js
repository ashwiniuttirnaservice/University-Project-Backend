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

studentRouter.post("/candidate", registerCandidate);

studentRouter.post(
  "/register",
  upload.fields([
    { name: "profilePhotoStudent", maxCount: 1 },
    { name: "idProofStudent", maxCount: 1 },
  ]),
  registerStudent
);

studentRouter.get("/all", getAllStudents);

studentRouter.get("/:studentId", getStudentById);

studentRouter.put(
  "/update/:studentId",
  upload.fields([
    { name: "profilePhotoStudent", maxCount: 1 },
    { name: "idProofStudent", maxCount: 1 },
  ]),
  updateStudent
);

studentRouter.delete("/delete/:studentId", deleteStudent);

module.exports = studentRouter;
