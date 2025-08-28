const express = require("express");
const testRouter = express.Router();
const upload = require("../utils/multer.js");

const {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  getTestsForCourse,
  submitTest,
  getTestResults,
  getSingleTestResult,
  getAllStudentResults,
  importTestsFromExcel,
} = require("../controllers/TestController");

const { protect, admin } = require("../middleware/authMiddleware.js");

testRouter.post(
  "/import-excel",
  protect,
  admin,
  upload.single("testExcel"),
  importTestsFromExcel
);
testRouter
  .route("/")
  .get(protect, admin, getAllTests)
  .post(protect, admin, createTest);

testRouter.route("/all-results").get(protect, admin, getAllStudentResults);

testRouter.route("/course/:courseId").get(protect, getTestsForCourse);

testRouter.route("/submit").post(protect, submitTest);

testRouter.route("/results").get(protect, getTestResults);

testRouter.route("/results/:id").get(protect, getSingleTestResult);

testRouter
  .route("/:id")
  .get(protect, getTestById)
  .put(protect, admin, updateTest)
  .delete(protect, admin, deleteTest);

module.exports = testRouter;
