const express = require("express");
const {
  enrollInCourse,
  getMyEnrollments,
  createEnrollment,
  getAllEnrollmentsAdmin,
  createStudentEnrollmentByAdmin,
  updateStudentEnrollmentByAdmin,
  getEnrollmentByIdAdmin,
  getEnrollmentById,
  unenrollFromCourse,
  markContentAsComplete,
  markContentAsIncomplete,
} = require("../controllers/enrollmentController.js");
const { protect, authorize } = require("../middleware/authMiddleware.js");

const enrollmentRouter = express.Router();
enrollmentRouter.post("/enroll", createEnrollment);
enrollmentRouter.post("/admin/enroll", createStudentEnrollmentByAdmin);
enrollmentRouter.put("/:id", updateStudentEnrollmentByAdmin);
enrollmentRouter.get("/", getAllEnrollmentsAdmin);
enrollmentRouter.get("/:id", getEnrollmentById);
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
