const express = require("express");
const enrollmentRouter = express.Router();

const upload = require("../utils/multer");
const checkAccess = require("../middleware/checkAccess");
const { protect } = require("../middleware/authMiddleware");

const {
  enrollInCourse,
  getMyEnrollments,
  createEnrollment,
  deleteEnrollment,
  getAllEnrollmentsAdmin,
  createStudentEnrollmentByAdmin,
  updateStudentEnrollmentByAdmin,
  getEnrollmentByIdAdmin,
  getEnrollmentById,
  unenrollFromCourse,
  markContentAsComplete,
  markContentAsIncomplete,
  uploadEnrollmentExcel,
} = require("../controllers/enrollmentController");

enrollmentRouter.post(
  "/enroll",

  createEnrollment
);

enrollmentRouter.post(
  "/admin/enroll",
  protect,
  checkAccess("enrollment", "create"),
  upload.single("profilePhotoStudent"),
  createStudentEnrollmentByAdmin
);

enrollmentRouter.put(
  "/:id",
  protect,
  checkAccess("enrollment", "update"),
  upload.single("profilePhotoStudent"),
  updateStudentEnrollmentByAdmin
);
enrollmentRouter.get(
  "/",
  protect,
  checkAccess("enrollment", "read"),
  getAllEnrollmentsAdmin
);
enrollmentRouter.get(
  "/:id",
  protect,
  checkAccess("enrollment", "read"),
  getEnrollmentById
);

enrollmentRouter.post(
  "/",
  protect,
  checkAccess("enrollment", "create"),
  enrollInCourse
);

enrollmentRouter.delete(
  "/:id",
  protect,
  checkAccess("enrollment", "delete"),
  deleteEnrollment
);

enrollmentRouter.get(
  "/my",
  protect,
  checkAccess("enrollment", "read"),
  getMyEnrollments
);

enrollmentRouter.post(
  "/:enrollmentId/complete",
  protect,
  checkAccess("enrollment", "update"),
  markContentAsComplete
);

enrollmentRouter.post(
  "/:enrollmentId/incomplete",
  protect,
  checkAccess("enrollment", "update"),
  markContentAsIncomplete
);
enrollmentRouter.delete(
  "/:id/unenroll",
  protect,
  checkAccess("enrollment", "delete"),
  unenrollFromCourse
);

enrollmentRouter.get(
  "/details/:id",
  protect,
  checkAccess("enrollment", "read"),
  getEnrollmentByIdAdmin
);

enrollmentRouter.post(
  "/upload",
  protect,
  checkAccess("enrollment", "create"),
  upload.single("excelFile"),
  uploadEnrollmentExcel
);

module.exports = enrollmentRouter;
