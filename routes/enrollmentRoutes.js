const express = require("express");
const {
  enrollInCourse,
  getMyEnrollments,
  // updateEnrollmentProgress, // <-- Ye ab use nahi ho raha hai
  createEnrollment,
  getAllEnrollmentsAdmin,
  getEnrollmentByIdAdmin,
  unenrollFromCourse,
  markContentAsComplete, // <-- Naya function import kiya
  markContentAsIncomplete, // <-- Naya function import kiya
} = require("../controllers/enrollmentController.js");
const { protect, authorize } = require("../middleware/authMiddleware.js");

const enrollmentRouter = express.Router();

// =================================================================
//                      STUDENT ROUTES
// =================================================================
enrollmentRouter.post("/enroll", createEnrollment);
// Student enrolls in a course
enrollmentRouter.route("/").post(enrollInCourse);

// Student gets their own list of enrolled courses
enrollmentRouter.get("/my", protect, getMyEnrollments);

// Student marks content as complete
enrollmentRouter
  .route("/:enrollmentId/complete")
  .post(protect, authorize("student"), markContentAsComplete);

// Student marks content as incomplete
enrollmentRouter
  .route("/:enrollmentId/incomplete")
  .post(protect, authorize("student"), markContentAsIncomplete);

// Student or Admin can unenroll from a course
// Note: This route must be placed carefully to avoid conflicts with other /:id routes
enrollmentRouter
  .route("/:id")
  .delete(protect, authorize("student", "admin"), unenrollFromCourse);

// =================================================================
//                      ADMIN ROUTES
// =================================================================

// Admin gets a list of all enrollments in the system
enrollmentRouter
  .route("/all")
  .get(protect, authorize("admin"), getAllEnrollmentsAdmin);

// Admin gets a single enrollment's details by its ID
// Using '/details/:id' to avoid any possible conflict with the '/:id' used for un-enrollment
enrollmentRouter
  .route("/details/:id")
  .get(protect, authorize("admin"), getEnrollmentByIdAdmin);

// The old progress route has been removed.
// router.route('/:id/progress')
//     .put(protect, authorize('student'), updateEnrollmentProgress);

module.exports = enrollmentRouter;
