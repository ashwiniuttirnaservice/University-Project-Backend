const express = require("express");
const {
  enrollInCourse,
  getMyEnrollments,
  createEnrollment,
  getAllEnrollmentsAdmin,
  getEnrollmentByIdAdmin,
  unenrollFromCourse,
  markContentAsComplete,
  markContentAsIncomplete,
} = require("../controllers/enrollmentController.js");
const { protect, authorize } = require("../middleware/authMiddleware.js");

const enrollmentRouter = express.Router();

enrollmentRouter.post("/enroll", createEnrollment);
enrollmentRouter.get("/", getAllEnrollmentsAdmin);
enrollmentRouter.route("/").post(enrollInCourse);

enrollmentRouter.get("/my", protect, getMyEnrollments);

enrollmentRouter
  .route("/:enrollmentId/complete")
  .post(protect, authorize("student"), markContentAsComplete);

enrollmentRouter
  .route("/:enrollmentId/incomplete")
  .post(protect, authorize("student"), markContentAsIncomplete);

enrollmentRouter
  .route("/:id")
  .delete(protect, authorize("student", "admin"), unenrollFromCourse);

enrollmentRouter
  .route("/details/:id")
  .get(protect, authorize("admin"), getEnrollmentByIdAdmin);

module.exports = enrollmentRouter;
